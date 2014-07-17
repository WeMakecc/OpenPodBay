var http = require('http');

var config = require('../config');

module.exports.setup = function(app) {
    var p = config.getLocalAuth().portWebpanel;

    serverWebpanel = http.createServer(app);
    serverWebpanel.listen(p, function() {
        console.log('Webpanel on port %d', serverWebpanel.address().port);
    });

}