module.exports = function(port) {

    var rootPath = require('path').dirname(require.main.filename);
    var u = require(rootPath+'/utils.js');

    var express = require('express'),
        app = express();

    [
        'api.js',
        'authentication.js',
        'transport.js'
    ].map (function(controllerName) {
        controller = require('./' + controllerName);
        controller.setup(app)
    });

    return app;
}