var http = require('http');

var config = require('../config'),
    rootPath = require('path').dirname(require.main.filename);

// module.exports.setup = function(app) {
//     var p = config.getLocalAuth().portWebpanel;
//     serverWebpanel = http.createServer(app);
//     serverWebpanel.listen(p, function() {
//         console.log('Webpanel on port %d', serverWebpanel.address().port);
//     });
// }

var https = require('https');
var fs = require('fs');

var opts = {
  // Server SSL private key and certificate
  key: fs.readFileSync(rootPath+'/keys/server.key'),
  cert: fs.readFileSync(rootPath+'/keys/server.crt'),
  // issuer/CA certificate against which the client certificate will be
  // validated. A certificate that is not signed by a provided CA will be
  // rejected at the protocol layer.
  ca: fs.readFileSync(rootPath+'/keys/ca.crt'),
  // request a certificate, but don't necessarily reject connections from
  // clients providing an untrusted or no certificate. This lets us protect only
  // certain routes, or send a helpful error message to unauthenticated clients.
  // requestCert: true,
  rejectUnauthorized: false
};

module.exports.setup = function(app) {
    var p = config.getLocalAuth().portWebpanel;

    var serverWebpanel = https.createServer(opts, app);
    serverWebpanel.listen(p, function() {
        console.log('Webpanel on port %d', serverWebpanel.address().port);
    });
}