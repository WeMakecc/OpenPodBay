var bodyParser = require('body-parser');

var rootPath = require('path').dirname(require.main.filename);

module.exports.setup = function(app){

    app.use(bodyParser());

    app.get('/status', function(req, res) {
        res.json({status:"OK"});
    });
}