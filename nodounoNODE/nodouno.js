var express = require('express'),
    http = require('http'),
    app = express(),
    fs = require('fs');

var config = require('./config');

[
    'api.js',
    'authentication.js',
    'transport.js'
].map (function(controllerName) {
    controller = require('./' + controllerName);
    controller.setup(app)
});

pinger = require('./pinger.js');
