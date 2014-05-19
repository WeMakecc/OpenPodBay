var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();
app.use(bodyParser());

var params = {}
params.express = express;
params.bodyParser = bodyParser;
params.app = app;

/********************************

get /
get /version

********************************/

app.get('/', function(req, res) {
    res.send('Hello');
});

app.get('/version', function(req, res) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write('version..<br/>');
    res.write('V8: '+process.version.v8+'<br/>');
    res.write('Node: '+process.version+'<br/>');
    res.write('Express: '+'TODO'+'<br/>');
    res.write('DbLite: '+'TODO'+'<br/>');
    res.end();
});

require('./view')(params);
require('./api')(params);

/********************************

start the server

********************************/

var port = 3000;

var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});