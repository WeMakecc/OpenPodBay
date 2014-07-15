var rootPath = require('path').dirname(require.main.filename),
    fs = require('fs'),
    model = require(rootPath+'/model/model.js'),
    u = require(rootPath+'/utils.js');

module.exports = function(app) {

    app.get('/', function(req, res) {
        res.render('home.ejs', path('Home', req));
    });

    //---------------------------------------------------------------- API lists
    app.get('/api', function(req, res){
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
    app.get('/users', function(req, res) {
        res.render('users.ejs', path('User list', req));
    });

    app.get('/users/add', function(req, res){
        res.render('adduser.ejs', path('Add user', req));
    });

    app.get('/users/search-by-tag', function(req, res){
        var p = path('Search users by tag', req);
        res.render('search_user_by_tag.ejs', p);
    });


    app.get('/users/:id', function(req, res){
        var id = req.params.id,
            p = path('User #'+id, req);
        p['id'] = id;    
        res.render('user.ejs', p);
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
                var lastLines = lines.slice(-50, -1);

                p['logs'] = JSON.parse('['+lastLines+']');
            }
            res.render('log.ejs', p);
        });
    }

    app.get('/log/error', function(req, res) {
        var log_path = rootPath+'/log/error.log';
        getLogView('Error log', log_path, req, res);
    });

    app.get('/log/db', function(req, res) {
        var log_path = rootPath+'/log/db.log';
        getLogView('Db log', log_path, req, res);
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