module.exports = function(port) {

    var rootPath = require('path').dirname(require.main.filename);
    var u = require(rootPath+'/utils.js');
    var internal = require('./internal');

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

    var timerId = setInterval(internal.checkAssetReservations , 10000); 
    internal.checkAssetReservations();

    var timerId = setInterval(internal.checkAssetReservationsEnd , 10000); 
    internal.checkAssetReservationsEnd();

    return app;
}