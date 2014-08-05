module.exports = function() {

    //---------------------------------------------------------------- import dependencies
    var rootPath = require('path').dirname(require.main.filename);
    var u = require(rootPath+'/utils.js');

    var express = require('express'),
        http = require('http'),
        app = express();

    [
        'transport.js',
        'authentication.js',
        'api.js',
        'external.js',
        'viewer.js'
    ].map (function(controllerName) {
        controller = require('./' + controllerName);
        controller.setup(app)
    });

    return app;
}