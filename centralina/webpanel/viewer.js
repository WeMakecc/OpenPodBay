var rootPath = require('path').dirname(require.main.filename),
    fs = require('fs'),
    model = require(rootPath+'/model/model.js'),
    u = require(rootPath+'/utils.js'),
    authentication = require('./authentication.js')

var express = require('express');

module.exports.setup = function(app) {

    app.set('views', __dirname + '/views');
    app.use('/', express.static(__dirname + '/static'));
    app.set('view engine', 'ejs');
    app.engine('html', require('ejs').renderFile);

    //---------------------------------------------------------------- session login

    app.get('/login', function (req, res) {
        res.render('login.ejs',{"title":"Login"});
    });

    app.post('/session/login', authentication.login);

    app.get('/session/logout', authentication.logout);

    app.get('/', authentication.ensureAuthenticated, function(req, res) {
        res.render('home.ejs', path('Home', req));
    });

    //---------------------------------------------------------------- API lists
    app.get('/api', authentication.ensureAuthenticated, function(req, res){
        var table = u.listAllAPI(app),
            api = [];
        for(var i=0; i<table.length; i++) {
            api.push(table[''+i]);
        }
        res.render( 'api', { 
            title: 'API List',
            api: api
        });
    });

    //---------------------------------------------------------------- AJAX API end point
    app.get('/users', authentication.ensureAuthenticated, function(req, res) {
        res.render('users.ejs', path('User list', req));
    });

    app.get('/users/add', authentication.ensureAuthenticated, function(req, res){
        res.render('adduser.ejs', path('Add user', req));
    });

    app.get('/users/search-by-tag', authentication.ensureAuthenticated, function(req, res){
        var p = path('Search users by tag', req);
        res.render('search_user_by_tag.ejs', p);
    });


    app.get('/users/:id', authentication.ensureAuthenticated, function(req, res){
        var id = req.params.id,
            p = path('User #'+id, req);
        p['id'] = id;    
        res.render('user.ejs', p);
    });

    app.get('/groups', authentication.ensureAuthenticated, function(req, res) {
        res.render('groups.ejs', path('Group list', req));
    });

    app.get('/machines', authentication.ensureAuthenticated, function(req, res){
        res.render('machines.ejs', path('Machine list', req));
    });

    app.get('/reservations', authentication.ensureAuthenticated, function(req, res){
        res.render('reservations.ejs', path('Reservation list', req));
    });

    app.get('/reservations/add', authentication.ensureAuthenticated, function(req, res){
        res.render('add_reservation.ejs', path('Add reservation', req));
    });

    //---------------------------------------------------------------- log viewer
    function getLogView(title, log_path, req, res) {
        var id = req.params.id,
            p = path(title, req);

        fs.readFile(log_path, 'utf-8', function(err, data) {
            if (err) {
                p['logs'] = [{timestamp: u.getNowPrettyPrint(), message:log_path+'does not exist!'}];
            } else {
                var lines = data.trim().split('\n');
                var lastLines = lines.slice(-50, lines.length).reverse();
                lastLines = lastLines.filter(function(n){ return n != undefined });

                p['logs'] = JSON.parse('['+lastLines+']');
            }
            res.render('log.ejs', p);


        });
    }

    app.get('/log/error', authentication.ensureAuthenticated, function(req, res) {
        var log_path = rootPath+'/log/error.log';
        getLogView('Error log', log_path, req, res);
    });

    app.get('/log/db', authentication.ensureAuthenticated, function(req, res) {
        var log_path = rootPath+'/log/db.log';
        getLogView('Db log', log_path, req, res);
    });
    app.get('/log/network', authentication.ensureAuthenticated, function(req, res) {
        var log_path = rootPath+'/log/network.log';
        getLogView('Network log', log_path, req, res);
    });
    app.get('/log/login', authentication.ensureAuthenticated, function(req, res) {
        var log_path = rootPath+'/log/login.log';
        getLogView('Network log', log_path, req, res);
    });

    //---------------------------------------------------------------- utils
    var path = function(title, req) {
        var o = {
            title: title,
            resources_url: u.getURL(req)+'',
            api_url: u.getURL(req)+'/api'
        };
        return o;
    };


}