var bodyParser = require('body-parser');

var rootPath = require('path').dirname(require.main.filename),
    u = require(rootPath+'/utils.js'),
    model = require(rootPath+'/model/model.js');

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
            }
        });

        res.send(200);
    });
}