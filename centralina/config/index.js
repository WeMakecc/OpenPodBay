var fs = require('fs'),
    rootPath = require('path').dirname(require.main.filename);
    localAuth = JSON.parse(fs.readFileSync(rootPath+'/config/local.auth')),
    mailAuth = JSON.parse( fs.readFileSync('./config/mail.auth', 'utf8') );


module.exports = {

    getLocalAuth: function() {
        return localAuth;
    },
    getMailAuth: function() {
        return mailAuth;
    }

}