var rootPath = require('path').dirname(require.main.filename),
    model = require(rootPath+'/model/model.js'),
    u = require(rootPath+'/utils.js'),
    _ = require('underscore');

var bodyParser = require('body-parser');

var crypto = require('crypto');

function random (howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}

module.exports.setup = function(app){

    app.use(bodyParser()); // get information from html forms

    function makeResponse(errors, response) {

        var ret = {
            status: "ok",
            response: response?'y':'n',
            errors: errors
        };

        if(response) {
            var token = random(12);
            ret['token'] = token;
            model.setToken(token, function() {});
        };

        return ret;
    }

    //--------------------------------------------------------------- callee
    app.get('/external/modifyUser', function(req, res) {
        console.log('/external/modifyUser > handling the get');
        var elements = {
            user_id: req.query.user_id, 
            role: req.query.role, 
            username: req.query.username, 
            status: req.query.status, 
            credits: req.query.credits, 
            timestamp: req.query.timestamp
        };

        var Schema = {
            user_id: Number,
            role: String,
            username: String,
            status: Number,
            credits: Number,
            timestamp: Number
        };

        model.getToken(function(result) {
            console.log(result.token+"   "+req.headers.token);
            console.log(req.headers.hasOwnProperty('authorization'));
            console.log(result.authorization != req.headers.token);
            if( req.headers.hasOwnProperty('authorization') && result.token != req.headers.authorization ) {
                var errors = [{code:3, description:"Unhatorized", params:['token']}];
                res.send( makeResponse(errors, false) );
                return;
            } else {
                var errors = parseElement(elements, Schema);

                if(errors.length>0) {
                    res.send( makeResponse(errors, false) );
                    return;
                }
                
                    model.modifyOrInsertUser(elements.user_id, elements.username, 
                                             elements.role, elements.status, 
                                             elements.credits, 1, function(result) {
                    res.send( makeResponse(errors, true) );
                });
            }
        });
    });

    app.get('/external/modifyOrder', function(req, res) {
        var elements = {
            user_id: req.query.user_id,
            asset_id: req.query.asset_id,
            time_start: req.query.time_start,
            duration: req.query.duration,
            status: req.query.status,
            timestamp: req.query.timestamp
        }

        var Schema = {
            user_id: Number,
            asset_id: Number,
            time_start: Number,
            duration: Number,
            status: Number,
            timestamp: Number
        };

        var errors = parseElement(elements, Schema);
        
        // TODO: check on db, of course..
        var ret = {
            0: {
                response: errors.length==0 ? 'y' : 'n'
            },
            1: {
                errors: errors
            }
        }

        res.send(ret);
    });

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
