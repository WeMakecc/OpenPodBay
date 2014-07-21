var config = require('./config');
var u = require('./utils.js');


require('./webpanel')();
require('./service')();

//------------------------------------------------------- google pinger
// TODO: will be a module with a class
var fs = require('fs');
var pingGoogle = function() {

    var sys = require('sys');
    var exec = require('child_process').exec;
    exec("ping -c 1 www.google.com", function(error, stdout, stderr) {

        if(error) {
            u.getLogger().network('PING: '+' -1');
            return;
        }
        // hand made ping stdout parser
        var t = ''+stdout.split('\n')[1].split(' ')[6].split('=')[1];

        u.getLogger().network('PING: '+t);
    });
}
setInterval(pingGoogle, 1000*60);
pingGoogle();

//------------------------------------------------------- startup mail
u.sendMail({
    subject: "[Pod bay door] start",
    text: u.getNowPrettyPrint() + " restart server"},
    config.getMailAuth());