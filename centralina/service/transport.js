var http = require('http');

var config = require('../config');

module.exports.setup = function(app){
    var p = config.getLocalAuth().portService;

    serverService = http.createServer(app);
    serverService.listen(p, function() {
        console.log('Service on port %d', serverService.address().port);
    });
}