/*
   External API called from the wordpress portal
*/

var rootPath = require('path').dirname(require.main.filename),
    model = require(rootPath+'/model'),
    u = require(rootPath+'/utils.js'),
    _ = require('underscore'),
    cript = require(rootPath+'/wordpress.js');

var bodyParser = require('body-parser'),
    url = require('url');

var wordpressAuth = require(rootPath+'/config');.getWordpressAuth();    

var QueryUserSchema = {
    user_id: Number,
    role: String,
    username: String,
    status: Number,
    credits: String,
    timestamp: Number
};

var QuesryOrderSchema = {
    user_id: Number,
    asset_id: Number,
    time_start: Number,
    duration: Number,
    status: Number,
    timestamp: Number
};


module.exports.setup = function(app){

    app.use(bodyParser()); // get information from html forms
    retryBadCalls();

    function makeResponse(errors, response) {

        var ret = {
            status: "ok",
            response: response?'y':'n',
            errors: errors
        };

        return ret;
    }

    function decriptQueryString(req) {
        // decript querystring
        var querystringCrypt = null;
        for(var property in req.query) {
            querystringCrypt = property;
            break;
        }
        var querystringClear = 'http://foo.com/foo?'+cript.decript(querystringCrypt),
            query = url.parse(querystringClear, true).query;

        console.log('decriptQueryString > querystringClear: '+querystringClear);

        logger.external(querystringClear);

        return query;
    }

    function checkDeleteUser(res, query, _callback) {
        var params_for_deleteuser = [query.role, query.username, query.status, query.credits];
        var delete_user = _.every(params_for_deleteuser, function(n) {
            return n=='-1';
        });

        if(delete_user) {
            model.getUser(query.user_id, function(result) {
                if (result.length==1) {
                    model.deleteUserById(query.user_id, function(result2) {
                        var errors = [];
                        res.json( makeResponse(errors, true) );

                        _callback(true);
                    });
                } else {
                    var errors = [];
                    errors.push({code:'1', description:'User '+query.user_id+' not exists', params:['id' /*, query.user_id*/]});
                    res.json( makeResponse(errors, false) );

                    _callback(true);
                }
            });
        } else {

            _callback(false);
        }
    }

    function checkDeleteOrder(res, query, _callback) {

        var params_for_deleteorder = [query.user_id, query.asset_id, query.time_start, query.duration, query.status];
        var delete_order = _.every(params_for_deleteorder, function(n) {
            return n=='-1';
        });

        if(delete_order) {
            model.getReservationById(query.order_id, function(result) {
                if (result.length==1) {
                    model.deleteReservation(query.order_id, function(result2) {
                        var errors = [];
                        res.json( makeResponse(errors, true) );

                        _callback(true);
                    });
                } else {
                    var errors = [];
                    errors.push({code:'1', description:'Order '+query.order_id+' not exists', params:['order_id'/*, query.order_id*/]});
                    res.json( makeResponse(errors, false) );

                    _callback(true);
                }
            });
        } else {

            _callback(false);
        }
    }

    //--------------------------------------------------------------- callee
    app.get('/external/modifyUser', function(req, res) {
        console.log('/external/modifyUser > handling the get');

        var query = decriptQueryString(req);

        // check if the user has to be deleted

        var user_deleted = checkDeleteUser(res, query, function(userCancelled) {
            if(userCancelled) {
                return;
            }
                
            var c = JSON.parse(new Buffer(query.credits, 'base64').toString('ascii'));

            var elements = {
                user_id: query.user_id, role: query.role, 
                username: query.username, status: query.status, 
                credits: c, timestamp: query.timestamp
            };
            
            var errors = parseElement(elements, QueryUserSchema);

            if(errors.length>0) {
                res.json( makeResponse(errors, false) );

            } else {
                model.modifyOrInsertUser(elements.user_id, elements.username, 
                                         elements.role, elements.status, 
                                         elements.credits, 1, function(result) {
                    res.json( makeResponse(errors, result) );
                });

                retryBadCalls();
            }
        });
    });

    app.get('/external/modifyOrder', function(req, res) {
        console.log('/external/modifyOrder > handling the get');

        var query = decriptQueryString(req);

        var order_deleted = checkDeleteOrder(res, query, function(orderCancelled) {
            if(orderCancelled) {
                return;
            }

            var elements = {
                reservation_id: query.order_id, user_id: query.user_id,
                asset_id: query.asset_id, time_start: query.time_start,
                duration: query.duration, status: query.status,
                timestamp: query.timestamp
            }

            var errors = parseElement(elements, QuesryOrderSchema);
           
            if(errors.length>0) {
                res.send( makeResponse(errors, false) );
                return;
            } else {
                
                model.modifyOrInsertReservation(elements.reservation_id, elements.user_id,
                                                elements.asset_id, elements.time_start,
                                                -1, elements.duration,
                                                -1, 1,
                                                function(result) {
                    res.send( makeResponse(errors, result) );
                });

                retryBadCalls();
            }
        });
    });


    function retryBadCalls() {
        var url = wordpressAuth.ip+wordpressAuth.retryUser;
        var options = {
            url: url ,
            rejectUnauthorized: false,
            requestCert: true,
            agent: false
        };
        request(options, function (error, response, body) {
            if (error) {
                u.getLogger().error('webpanel > external.js > retryBadCalls: WORDPRESS > problem in callling '+url+' '+error);
                return;
            }
        }); 

        var url = wordpressAuth.ip+wordpressAuth.retryOrder;
        var options = {
            url: url ,
            rejectUnauthorized: false,
            requestCert: true,
            agent: false
        };
        request(options, function (error, response, body) {
            if (error) {
                u.getLogger().error('webpanel > external.js > retryBadCalls: WORDPRESS > problem in callling '+url+' '+error);
                return;
            }
        }); 
    }

    //--------------------------------------------------------------- utils
    function isNumeric(value) {
        return /^\d+$/.test(value);
    }

    function parseElement(elements, QuerySchema) {
        errors = [];
        // TODO: more functional
        for(var key in elements) {
            if(!elements.hasOwnProperty(key) || !(elements[key])) {
                errors.push({code:'1', description:'Missing parameter', params:[key]});
            } else {
                var val = elements[key];
                if(val==='') {
                    errors.push({code:'1', description:'Missing parameter', params:[key]});
                } else if( QuerySchema[key]==Number && !isNumeric(elements[key])) {
                    errors.push({code:'2', description:'cast error', params:[key, elements[key]]});
                } else {
                }
            }
        }
        return errors;
    }

    //--------------------------------------------------------------- caller
}
