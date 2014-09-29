logger = require('./logger.js');

module.exports = {

    /* get now in second (unix timestamp) */
    getNow: function() {
        return Math.round(+new Date()/1000);
    },

    getNowPrettyPrint: function() {
        // http://stackoverflow.com/a/13219636/433685
        var now = new Date()
        .toISOString()
        .replace(/T/, ' ')       // replace T with a space
        .replace(/\..+/, '')     // delete the dot and everything after

        return now;
    },

    sendMail: function(mail, auth) {
        var fs = require('fs');
        // the server is up: send notification mail
        var nodemailer = require("nodemailer");
        var smtpTransport = nodemailer.createTransport("SMTP",{
            service: "Gmail",
            auth: {
                user: auth.username,
                pass: auth.password
           }
        });
        var mailOptions = {
            from: "nootropic.kint@gmail.com", // sender address
            to: "nootropic.kint@gmail.com", // list of receivers
            subject: mail.subject, // Subject line
            text: mail.text // plaintext body
        }
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }
        });
    },

    getURL: function(req) {
        return req.protocol+'://'+req.get('host');
    },

    getLogger: function() {
        return logger;
    },

    //----------------------------------------------------------- list all API        
    listAllAPI: function(app) {
        var Table = require('cli-table'),
            table = new Table({ head: ["Type", "Name"], colWidths: [10, 40] });

        var routes = app._router.stack;

        for (var key in routes) {
            if (routes.hasOwnProperty(key)) {
                var val = routes[key];
                if(val.route) {
                    var _o = [val.route.stack[0].method, val.route.path];
                    table.push(_o);
                }
            }
        }
        return table;
    }
}