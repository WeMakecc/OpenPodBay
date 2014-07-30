module.exports = function(port) {

    var rootPath = require('path').dirname(require.main.filename);
    var u = require(rootPath+'/utils.js');

    var express = require('express'),
        app = express();

    [
        'authentication.js',
        'transport.js',
        'api.js'
    ].map (function(controllerName) {
        controller = require('./' + controllerName);
        controller.setup(app)
    });

    return app;
}