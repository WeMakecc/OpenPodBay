var bodyParser = require('body-parser'),
    request = require('request'),
    async = require('async');

var rootPath = require('path').dirname(require.main.filename),
    u = require(rootPath+'/utils.js'),
    model = require(rootPath+'/model/model.js'),
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

        model.modifyMachine(body.id, ip, u.getNow(), body.status, 1, function(result) {
            if(result == false) {
                u.getLogger().error('Service > parse node status '+body.id+' '+ip+' '+body.status);
            } else {
                u.getLogger().network('the machine #'+body.id+' at '+ip+' is alive with status: '+body.status);
            }
        });

        res.send(200);
    });

    app.post('/checkin', function(req,res) {
        var ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        var body = req.body;

        var asset_id = body.asset_id;
        var tag_id = body.tag_id;
        var actual_time_checkin = u.getNow();


        // TODO: double check that the ip correspond to the given node id
        //var asset_id_from_db = model.getNodeId(ip);
        //if(asset_id_from_db != asset_id) { error(...) }
        
        model.findUserByTagValue(tag_id, function(result) {
            // TODO: if a tag is associated to more then one user.. BOOM
            if(result.length==0) {
                u.getLogger().error('SERVICE API: /checkin > asking for a tag without user '+tag_id);
                res.send('n').end(200);
                return;
            }

            var user_id = result[0].user_id;








            var tagValue = tag_id,
                
                nodeId = asset_id,
                remoteAddress = ip;

            console.log('app.get---> /checkin\n'+
                        '            tag: '+tagValue+', '+'asset: '+nodeId+',\n'+
                        '            from: '+remoteAddress);


            function paddy(n, p, c) {
                var pad_char = typeof c !== 'undefined' ? c : '0';
                var pad = new Array(1 + p).join(pad_char);
                return (pad + n).slice(-pad.length);
            }

            var now = new Date().now;
            // var timestamp_sql_format = '';
            // timestamp_sql_format += now.getFullYear()+'-';
            // timestamp_sql_format += paddy(now.getMonth(), 2)+'-';
            // timestamp_sql_format += paddy(now.getDate(), 2)+' ';
            // timestamp_sql_format += paddy(now.getHours(), 2)+':';
            // timestamp_sql_format += paddy(now.getMinutes(), 2);

            model.askReservation(timestamp_sql_format, tagValue, nodeId, function(err, _res) {
                res.send(_res).status(200).end();
                if(_res=='y') {
                    forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin); //@    
                }
            })











            // TODO: check in the db if the tag is associated to a reservation 
            //       and send back a response to the node/machine/asset
            //model.checkReservation....
            //.. res.send(200)
            //.. or res.send(404)
            //res.send('y').end(200);

            
        });
    });

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
                u.getLogger().error('SERVICE API: /checkout > asking for a tag without user '+tag_id);
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
}