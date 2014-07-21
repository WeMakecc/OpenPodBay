var rootPath = require('path').dirname(require.main.filename),
    model = require(rootPath+'/model/model.js'),
    u = require(rootPath+'/utils.js'),
    _ = require('underscore');

var bodyParser = require('body-parser');

module.exports.setup = function(app){

    app.use(bodyParser()); // get information from html forms

    //--------------------------------------------------------------- callee
    app.get('/external/modifyUser', function(req, res) {
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
            status: String,
            credits: Number,
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
                
                if( QuerySchema[key]==Number && !isNumeric(elements[key])) {
                    errors.push({code:'2', description:'cast error', params:[key, elements[key]]});
                } else {
                }
            }
        }
        return errors;
    }

    //--------------------------------------------------------------- caller
}
