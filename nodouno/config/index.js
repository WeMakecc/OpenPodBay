var fs = require('fs'),
    rootPath = require('path').dirname(require.main.filename);
    localAuth = JSON.parse(fs.readFileSync(rootPath+'/config/local.auth', 'utf8')),
    serverAuth = JSON.parse( fs.readFileSync('./config/server.auth', 'utf8') );


module.exports = {

    getLocalAuth: function() {
        return localAuth;
    },
    getServerAuth: function() {
        return serverAuth;
    }

}