var bodyParser = require('body-parser'),
    request = require('request'),
    async = require('async');

var rootPath = require('path').dirname(require.main.filename),
    u = require(rootPath+'/utils.js'),
    model = require(rootPath+'/model/model.js');

module.exports.setup = function(app){

    setToken('a');
    authenticateInWordress( function(){} ); // so I have a valid token
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
        
        var user_id = model.findUserByTagValue(tag_id, function(result) {
            // TODO: if a tag is associated to more then one user.. BOOM
            if(result.length==0) {
                u.getLogger().error('SERVICE API: /checkin > asking for a tag without user '+tag_id);
                res.send(404);
            }

            var user_id = result[0].user_id;

            // TODO: check in the db if the tag is associated to a reservation 
            //       and send back a response to the node/machine/asset
            //model.checkReservation....
            //.. res.send(200)
            //.. or res.send(404)
            res.send(200);

            //forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin);
            forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin);
        });
    });

    function forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin) {
        var url = 'http://'+wordpressAuth.ip+wordpressAuth.checkin +'?';
        url += 'user_id='+user_id+
               '&asset_id='+asset_id+
               '&actual_time_checkin='+actual_time_checkin+
               '&timestamp_last_info='+12345;

        var options = makeOptionWithToken(url, function(options) {
            request(options, function (error, response, body) {
                if (error) {
                    u.getLogger().error('WORDPRESS > problem in callling madeCheckin '+error);
                    return;
                } 

                body = JSON.parse(body);
                if(body.errors.length>0 ) {
                    if(parseInt(body.errors[0].code) == 3) {
                        authenticateInWordress(function() {
                            forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin);
                        });
                    } else if(body.response=='y') {
                        setToken( body.token );
                        console.log('forwardCheckinToWordpress > OK');
                    } else {
                        var error_log = 'forwardCheckinToWordpress > errors:';
                        for(var i=0; i<body.errors.length; i++) {
                            error_log += JSON.stringify(body.errors[i]);
                        }
                        u.getLogger().error(error_log);
                    }
                }
            });
        });
    }

    app.post('/checkout', function(req,res) {
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

            //forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin);
            forwardCheckoutToWordpress(user_id, asset_id, actual_time_checkin);
        });
    });

    function forwardCheckoutToWordpress(user_id, asset_id, actual_time_checkin) {
        var url = 'http://'+wordpressAuth.ip+wordpressAuth.checkout +'?';
        url += 'user_id='+user_id+
               '&asset_id='+asset_id+
               '&actual_time_checkout='+actual_time_checkin+
               '&timestamp_last_info='+12345;

        var options = makeOptionWithToken(url, function(options) {
            request(options, function (error, response, body) {
                if (error) {
                    u.getLogger().error('WORDPRESS > problem in callling madeCheckout '+error);
                    return;
                } 

                body = JSON.parse(body);
                if(body.errors.length>0 ) {
                    if(parseInt(body.errors[0].code) == 3) {
                        authenticateInWordress(function() {
                            forwardCheckinToWordpress(user_id, asset_id, actual_time_checkin);
                        });
                    } else if(body.response=='y') {
                        setToken( body.token );
                        console.log('forwardCheckoutToWordpress > OK');
                    } else {
                        var error_log = 'forwardCheckoutToWordpress > errors:';
                        for(var i=0; i<body.errors.length; i++) {
                            error_log += JSON.stringify(body.errors[i]);
                        }
                        u.getLogger().error(error_log);
                    }
                }
            });
        });
    }

    function authenticateInWordress(callback) {
        u.getLogger().info('WORDPRESS > invalid token, asking for a new one ');

        var url = 'http://'+wordpressAuth.ip+wordpressAuth.login;
        var auth = { username: wordpressAuth.username, password: wordpressAuth.password };
        request.post(url, {
            form: auth
        }, function(err, response, body) {
            body = JSON.parse(body);
            if(body.response=='y') {
                setToken( body.token );
                callback();
            } else {
                u.getLogger().error('WORDPRESS > problem in callling checkUser '+body);
            }
        });
    }

    //------------------------------------------------------- utility

    function makeOptionWithToken(url, callback) {
        model.getToken(function(result) {
            var options = {
                url: url,
                headers: {'Authorization': result.token }
            };
            callback(options);
        });

    };

    function setToken(token) {
        console.log('setToken: '+token);
        model.setToken(token, function() {});
    }

}