module.exports = function(port) {

    console.log('Web Panel: index.js > .');

    //---------------------------------------------------------------- import dependencies
    var rootPath = require('path').dirname(require.main.filename);
    var u = require(rootPath+'/utils.js');

    var express = require('express'),
        bodyParser = require('body-parser'),
        http = require('http'),
        app = express();

    //---------------------------------------------------------------- express server
    // init express things and
    // init ejs render engine
    app.set('views', __dirname + '/views');
    app.use('/', express.static(__dirname + '/static'));
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);
    app.use(bodyParser()); // get information from html forms
    
    // init the webpanel viewer
    viewer = require('./viewer.js')(app); // the views end point
    // init the AJAX API
    api = require('./api.js')(app);

    //---------------------------------------------------------------- some test end point
    app.get('/hello', function(req, res){
        res.send('Hello');
    });

    app.get('/public/test', function (req, res) {
        res.json({"color":"rgb(175,31,36)"});
    });


    // done!
    return app;
}