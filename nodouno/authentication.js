var auth = require('basic-auth');

module.exports.setup = function(app){
    // basic auth to all apis
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