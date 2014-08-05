var rootPath = require('path').dirname(require.main.filename),
    model = require(rootPath+'/model/model.js'),
    u = require(rootPath+'/utils.js'),
    config = require(rootPath+'/config'),
    authentication = require('./authentication.js');

var bodyParser = require('body-parser')
    request = require('request');

module.exports.setup = function(app){

    app.use(bodyParser()); // get information from html forms

    var http = require('http'),
        fs = require('fs');

    app.get('/api/users', authentication.ensureAuthenticated, function(req, res) {
        model.getUsers(function(_res) {
            res.json(_res);
        });
    });

    app.post('/api/users/add', authentication.ensureAuthenticated, function(req, res) {
        var username = req.body.userName,
            active = req.body.active,
            group = req.body.group,
            status = req.body.status,
            credits = req.body.credits;

        model.addUser(username, group, status, credits, function(result) {
            res.send(result ? 200 : 404);
        });
    });

    app.get('/api/users/:user_id', authentication.ensureAuthenticated, function(req, res) {
        var id = req.params.user_id;
        model.getUser(id, function(_res) {
            res.json(_res);
        })
    });

    app.delete('/api/users/:user_id', authentication.ensureAuthenticated, function(req, res) {
        var id = req.params.user_id;
        id = parseInt(id);
        model.deleteUserById(id, function(_res) {
            res.send(res ? 200 : 404);
        });
    });

    app.put('/api/users/:id', authentication.ensureAuthenticated, function (req, res) {
        var userName = req.body.userName,
            group = req.body.group,
            active = req.body.active,
            id = req.body.userId;

        model.modifyUser(id, userName, group, active, function(_res) {
            res.send(res ? 200 : 404);
        })
    });

    app.get('/api/tag-by-user/:user_id', authentication.ensureAuthenticated, function(req, res) {
        var id = req.params.user_id;
        model.findTagById(id, function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/search-by-tag/:tag_value', authentication.ensureAuthenticated, function(req, res) {
        var tag_value = req.params.tag_value;
        model.findUserByTagValue(tag_value, function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/machines', authentication.ensureAuthenticated, function(req, res) {
        model.getMachines(function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/reservations', authentication.ensureAuthenticated, function(req, res) {
        model.getReservations(function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/askTagToDeskNode', authentication.ensureAuthenticated, function(req, res) {
        model.getMachine(3, function(_res) {
            var ip = _res[0].current_ip;
            
            var username = config.getNodesAuth()['username'];
            var password = config.getNodesAuth()['password'];
            request('http://'+ip+'/data/get/uidString',
                function (error, response, body){
                    body = JSON.parse(body);
                    res.json({value: body.value});
                }).auth(username, password);
        });
    });

}
