"use strict";

var bodyParser = require('body-parser'),
    request = require('request'),
    async = require('async');

var rootPath = require('path').dirname(require.main.filename),
    u = require(rootPath+'/utils.js'),
    model = require(rootPath+'/model'),
    config = require(rootPath+'/config');

var cript = require(rootPath+'/wordpress.js');

var wordpressAuth = config.getWordpressAuth()

module.exports.setup = function(app){
    app.use(bodyParser()); // get information from html forms

    app.post('/notifyStatus', function(req, res) {
        var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        var body = req.body;

        var node_id = body.node_id,
            type = body.type,
            status = body.status;

        if( !node_id || !type || !status ) {
            u.getLogger().error('SERVICE > bad checkin request from '
                                 +ip+': '+JSON.stringify(req.body));
            res.send(404);
            return;
        }

        model.getMachine(node_id, function(res) {

            if(res.length!=0) {
                model.modifyMachine(node_id, ip, u.getNow(), status, type, 1, function(result) {
                    u.getLogger().network('the machine #'+node_id+' at '+ip+' is alive with status: '+status);
                });
            } else {
                var defaultLabel = type+node_id;
                model.addMachine(node_id, ip, u.getNow(), status, 1, type, defaultLabel, function(result) {
                   u.getLogger().network('the machine #'+node_id+' at '+ip+' is new with status: '+status); 
                });
            }
        });

        res.send(200);
    });

    function checkinNegate(res) {
        res.send('n').end(200);
    }
    function checkinAccess(res, user_id, node_id, now) {
        res.send('y').end(200);
        forwardCheckinToWordpress(user_id, node_id, now); //@    
    }

    app.post('/checkin', function(req,res) {
        var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        var node_id = req.body.node_id;
        var tag_id = req.body.tag_id;

        if( !node_id || !tag_id ) {
            u.getLogger().error('SERVICE > bad checkin request from '
                                 +ip+': '+JSON.stringify(req.body));
            checkinNegate(res);
            return;
        }

        async.parallel([
            function(callback) {
                callback(null, [ip, res]); // pass some additional argument to the async handler
            },
            function(callback){
                model.findUserByTagValue(tag_id, function(result) {
                    if(result.length>0) {
                        callback(null, result);
                    } else {
                        u.getLogger().error('SERVICE > checkin request from '+ip+' #'+node_id+' but TAG '+tag_id+' not found in the database.');
                        checkinNegate(res);
                        callback(true, []);
                    }
                });
            },
            function(callback){
                model.getMachine(node_id, function(result) {
                    if(result.length>0) {
                        callback(null, result);
                    } else {
                        u.getLogger().error('SERVICE > checkin request from '+ip+' #'+node_id+' but NODE ID not found in the database.');
                        checkinNegate(res);
                        callback(true, []);
                    }
                });
            }
        ], handleCheckinRequest );

        // model.findUserByTagValue(tag_id, function(result) {
        //     // TODO: if a tag is associated to more then one user.. BOOM
        //     if(result.length==0) {
        //         u.getLogger().error('SERVICE API: /checkin > asking for a tag without user '+tag_id);
        //         res.send('n').end(200);
        //         return;
        //     }
        //     var user_id = result[0].user_id;
        //     var tagValue = tag_id,
        //         nodeId = asset_id,
        //         remoteAddress = ip;
        //     var now = new Date().now;
        //     console.log('app.get---> /checkin\n'+
        //                 '            tag: '+tagValue+', '+'asset: '+nodeId+',\n'+
        //                 '            from: '+remoteAddress);
        //     model.askReservation(now, tagValue, nodeId, function(_res) {
        //         res.send(_res).status(200).end();
        //         if(_res=='y') {
        //             
        //         }
        //     });
        // });
    });

    function handleCheckinRequest(err, results) {
        if(err) return;

        var ip = results[0][0],
            res = results[0][1],
            node_id = results[0][2],
            user = results[1][0],
            node = results[2][0],
            node_id = node.node_id
            ;
        
        if( ip != node.current_ip ) {
            u.getLogger().error('SERVICE > checkin request from '+ip+' #'+node_id+
                                ' but seems a different ip from the last one: '+node.current_ip+'.');
        }

        switch (node.type) {
            case 'asset': 
                console.log('ask reservation');
                askReservation(node, user, res);
                break;
            case 'gateway':
                askCalendar(node, user, res);
                break;
            default:
                u.getLogger().error('SERVICE > checkin request from '+ip+' #'+node_id+':'+node.type+' but type is not recognized.');
                break;
            }
    }

    function askReservation(node, user, res) {
        model.askReservation(u.getNow(), user.user_id, node.node_id, function(_res) {
            console.log('dudee ', _res);
            if(_res=='n') {
                console.log('nope');
                res.send('n').end(200);
            } else {
                console.log('yope');
                res.send('y60').end(200);
            }
        });
    }

    function askCalendar(node, user, res) {
        model.askCalendar(user.group, node.node_id, u.getNow(), function(_res) {
            if(_res) checkinAccess(res, user.user_id, node.node_id, u.getNow());
            else checkinNegate(res);
        });
    }

    function forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin) {
        var url = wordpressAuth.ip+wordpressAuth.checkin +'?';
        var uri = 'user_id='+user_id+
                  '&asset_id='+asset_id+
                  '&actual_time_check='+actual_time_checkin+
                  '&timestamp_last_info='+12345;

        forwardToWordpress(url, uri, ' Check IN');
    }

    app.post('/checkout', function(req,res) {
        var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        var body = req.body;

        var asset_id = body.asset_id;
        var tag_id = body.tag_id;
        var actual_time_checkout = u.getNow();

        // TODO: double check that the ip correspond to the given node id
        //var asset_id_from_db = model.getNodeId(ip);
        //if(asset_id_from_db != asset_id) { error(...) }
        
        var user_id = model.findUserByTagValue(tag_id, function(result) {
            // TODO: if a tag is associated to more then one user.. BOOM
            if(result.length==0) {
                u.getLogger().error('SERVICE: /checkout > asking for a tag without user '+tag_id);
                res.send(404);
            }

            var user_id = result[0].user_id;

            // TODO: check in the db if the tag is associated to a reservation 
            //       and send back a response to the node/machine/asset
            //model.checkReservation....
            //.. res.send(200)
            //.. or res.send(404)
            res.send(200);

            forwardCheckoutToWordpress(user_id, asset_id, actual_time_checkout); //@
        });
    });

    function forwardCheckoutToWordpress(user_id, asset_id, actual_time_checkin) {
        var url = wordpressAuth.ip+wordpressAuth.checkout +'?';
        var uri = 'user_id='+user_id+
                  '&asset_id='+asset_id+
                  '&actual_time_check='+actual_time_checkin+
                  '&timestamp_last_info='+12345+
                  '&checkout_type=0';

        console.log(uri);

        forwardToWordpress(url, uri, ' Check OUT');
    }

    function forwardToWordpress(url, uri, type) {
        console.log('forwardToWordpress > uri: '+uri);
        var options = {
            url: url + cript.cript(uri)
        };

        console.log(options.url);

        request(options, function (error, response, body) {
            if (error) {
                u.getLogger().error('WORDPRESS > problem in callling '+type+' '+error);
                return;
            } 

            console.log('forwardToWordpress > response:'+body);
            body = JSON.parse(body);
            if(body.errors && body.errors.length>0 ) {
                if(body.response=='y') {
                    console.log('forwardToWordpress > OK');
                } else {
                    var error_log = type+' > errors:';
                    for(var i=0; i<body.errors.length; i++) {
                        error_log += JSON.stringify(body.errors[i]);
                    }
                    u.getLogger().error(error_log);
                }
            }
        });
    }

    console.log('dudee');
    forwardCheckinToWordpress(3, 9, u.getNow());

}