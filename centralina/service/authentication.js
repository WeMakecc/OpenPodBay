auth = require('basic-auth'),
       localAuth = require('../config').getLocalAuth();
        
module.exports.setup = function(app) {

    // basic auth to all api in the Service
    app.use(function(req, res, next) {
        var user = auth(req);
        if (user === undefined || user['name'] !== localAuth.username || user['pass'] !== localAuth.password) {
            res.statusCode = 401;
            res.end('Unauthorized');
        } else {
            next();
        }
    });
}