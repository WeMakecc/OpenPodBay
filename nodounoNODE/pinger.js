var request = require('request'),
    fs = require('fs'),
    server = JSON.parse(fs.readFileSync('./config/server.auth')),
    s = server.protocol+server.ip+':'+server.port,
    status = require('./status.js');

function pingServer() {
    request(
    { 
        method: 'POST',
        uri: s+'/notifyStatus',
        port: server.port,
        auth: {
            username: server.username,
            password: server.password
        },
        form: status
    }, onNofityStatusAnswer);

}

function onNofityStatusAnswer(err, httpResponse, body) {
    if(err) {
        console.log('pinger onNofityStatusAnswer > '+err);
        return;
    }
    var statusCode = httpResponse.connection._httpMessage.res.statusCode;
    if(statusCode==404) {
        console.log('problem: '+statusCode);
    } else if(statusCode==200){
        console.log(body);
    }
}

function initPinger() {
    console.log('initPinger');
    
    setInterval(pingServer, 1000);
    pingServer();  
}

initPinger();
var Pinger = {}; 

module.exports = Pinger;