var http = require('http');
var fs = require('fs');

//----------------------------------------------------------------------------------  ctor
function Netscan() {
    console.log('NetScan > .');

    this.ip_already_done = 0;
    this.ip_max = 255;
    this.machines = {};

    var file = __dirname + '/' + 'yunApi.auth';
    var authString = fs.readFileSync(file).toString();
    this.auth = JSON.parse(authString);
}

//----------------------------------------------------------------------------------  scan
Netscan.prototype.scan = function(prefix, callback) {
    console.log('Netscan > scan');
    this.onDone = callback;

    for (var i = 0; i < this.ip_max; i++) {
        var ip = prefix+'.'+i;
        this.checkStatus(ip);
    }
}

Netscan.prototype.checkStatus = function (ip) {
    var that = this;
    var options = {
        host: ip,
        port: 80,
        path: '/arduino/status/1.1.1.1/'+ Math.floor((new Date()).getTime() / 1000),
        auth: this.auth.user+':'+this.auth.pass
    };

    var request = http.get(options, function(htres){
        var body = "";
        
        htres.on('data', function(data) {
            body += data;
        });
        htres.on('end', function() {
            if( htres.statusCode == 404 ) {
                that.onYunNotFound(options.host, {});
            } else {
                that.onYunFound(options.host, JSON.parse(body));
            }
        });
    }).on('error', function(e) {
        that.onYunNotFound(options.host, {});
        return;
    });

    request.on('socket', function (socket) {
        socket.setTimeout(5000);  
        socket.on('timeout', function() {
            request.abort();
        });
    });
}

//----------------------------------------------------------------------------------  collecting answer from clients
Netscan.prototype.onYunFound = function(ip, body) {
    console.log('NetScan > onYunFound '+ip+ ' ' +body.nodeId);
    body['ip'] = ip;
    this.machines[body.nodeId] = body;
    this.onAllIpDone();
}

Netscan.prototype.onYunNotFound = function(ip, body) {    
    this.onAllIpDone();
}

Netscan.prototype.onAllIpDone = function () {
    //console.log('Netscan > onAllIpDone '+this.ip_already_done);
    this.ip_already_done++;
    if(this.ip_already_done >= this.ip_max) {
        if (this.onDone && typeof(this.onDone) === "function") {
            // execute the callback, passing parameters as necessary
            this.onDone();
        }
    }
}

//----------------------------------------------------------------------------------  getter && setter

Netscan.prototype.getMachines = function() {
    return this.machines;
}

Netscan.prototype.getMachine = function(id) {
    return this.machines[id];
}

//---------------------------------------------------------------------------------- export
module.exports = Netscan;