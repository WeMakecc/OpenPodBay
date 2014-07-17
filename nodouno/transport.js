var http = require('http');

var config = require('./config');

module.exports.setup = function(app){
    var p = config.getLocalAuth().portNodouno;

    serverNodoUno = http.createServer(app);
    serverNodoUno.listen(p, function() {
        console.log('Webpanel on port %d', serverNodoUno.address().port);
    });
}