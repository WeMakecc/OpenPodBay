module.exports = function() {

    //---------------------------------------------------------------- import dependencies
    var rootPath = require('path').dirname(require.main.filename);
    var u = require(rootPath+'/utils.js');

    var express = require('express'),
        http = require('http'),
        app = express();

    [
        'api.js',
        'external.js',
        'authentication.js',
        'viewer.js',
        'transport.js'
    ].map (function(controllerName) {
        controller = require('./' + controllerName);
        controller.setup(app)
    });

    return app;
}