var rootPath = require('path').dirname(require.main.filename),
    model = require(rootPath+'/model'),
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
            id = req.body.userId,
            status = req.body.status,
            credits = req.body.credits;

        console.log(req.body);

        // id, username, group, status, credits, active,
        model.modifyUser(id, userName, group, status, credits, active, function(_res) {
            res.send(res ? 200 : 404);
        })
    });

    app.get('/api/tag-by-user/:user_id', authentication.ensureAuthenticated, function(req, res) {
        var id = req.params.user_id;
        model.findTagById(id, function(_res) {
            res.json(_res);
        })
    });

    app.post('/api/tag/add', authentication.ensureAuthenticated, function(req, res) {
        var user_id = req.body.user_id,
            tag_type = req.body.tag_type,
            tag_value = req.body.tag_value;

        model.addTag(user_id, tag_type, tag_value, function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/search-by-tag/:tag_value', authentication.ensureAuthenticated, function(req, res) {
        var tag_value = req.params.tag_value;
        model.findUserByTagValue(tag_value, function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/groups', authentication.ensureAuthenticated, function(req, res) {
        model.getGroups(function(_res) {
            res.json(_res);
        });
    });

    app.post('/api/groups/add', function(req, res) {
        var groupName = req.body.groupName;

        model.addGroup(groupName, function(result) {
            res.send(result ? 200 : 404);
        });
    });

    app.get('/api/machines', authentication.ensureAuthenticated, function(req, res) {
        model.getMachines(function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/machines/gateway', authentication.ensureAuthenticated, function(req, res) {
        model.getMachines(function(_res) {
            gateways = _res.filter(function(machine) {
                return machine.type=='gateway';
            });
            res.json(gateways);
        })
    });

    app.get('/api/machines/asset', authentication.ensureAuthenticated, function(req, res) {
        model.getMachines(function(_res) {
            assets = _res.filter(function(machine) {
                return machine.type=='asset';
            });
            res.json(assets);
        });
    });

    app.post('/api/machines/label/:id', authentication.ensureAuthenticated, function(req, res) {
        var id = req.params.id;
        var label = req.body.value; // the field value is passed by x-editable plugin

        model.setMachineLabel(id, label, function(_res) {
            res.send(_res ? 200 : 404);
        });
    });

    app.get('/api/machines/tick/:id', authentication.ensureAuthenticated, function(req, res) {
        var id = req.params.id;
        var label = req.body.value; // the field value is passed by x-editable plugin

        model.getMachine(id, function(_res) {
            console.log(_res);
            res.send(_res ? 200 : 404);

            var gateway = _res[0];
            console.log('I should tick the machine #'+id+' with ip: '+gateway.current_ip);
            var request = require('request');
            request.get('https://'+gateway.current_ip+'/arduino/doortick', 
                {timeout:15000},
                function (error, response, body) {
                    console.log('/api/machines/tick/:id > ',
                        'error: ',error, 
                        'response: ', response, 
                        'body: ',body);
                }
            ).auth(config.getNodesAuth().username, config.getNodesAuth().password, false);
        });
    });

    app.get('/api/reservations', authentication.ensureAuthenticated, function(req, res) {
        model.getReservations(function(_res) {
            res.json(_res);
        })
    });

    app.get('/api/reservation/default', authentication.ensureAuthenticated, function(req, res) {
        console.log('make default reservation');

        var user_id = 0,
            asset_id = 8,
            start_time = u.getNow()+60,
            duration = 60*2*10;

        model.addReservation(user_id, asset_id, start_time, duration, function(_res) {
            console.log('api.js > /api/reservations/default > '+_res);
            if(!_res) {
                res.json(_res).end(400);    
            }
            res.json(_res).end(200);
        });

        var internal = require(rootPath+'/service/internal');
        internal.checkAssetReservations();

        res.send(200);
    });

    app.get('/api/reservation/foralldays', authentication.ensureAuthenticated, function(req, res) {
        console.log('make some reservations for all the day long');

        var now = new Date();
        var startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var timestamp = startOfDay / 1000;

        for(var i=0; i<200; i++) {
            var user_id = 0,
                asset_id = 8,
                start_time = timestamp + 9*60*60 + i*4*60,
                duration = 60*3;

            model.addReservation(user_id, asset_id, start_time, duration, function(_res) {
                console.log('api.js > /api/reservations/default > '+_res);
                if(!_res) {
                    res.status(404);    
                }
                res.json(_res).end(200);
            });

            var internal = require(rootPath+'/service/internal');
            internal.checkAssetReservations();
        }

        res.send(200);
    });

    app.post('/api/reservations/add', authentication.ensureAuthenticated, function(req, res) {
        var user_id = req.body.userId,
            asset_id = req.body.assetId,
            start_time = req.body.start,
            duration = req.body.duration;

        model.addReservation(user_id, asset_id, start_time, duration, function(_res) {
            if(_res==false) {
                res.status(404);
            }
            res.json(_res).end(200);
        });
    });

    app.get('/api/askTagToDeskNode', authentication.ensureAuthenticated, function(req, res) {
        var deskNodeId = 8;
        model.getMachine(deskNodeId, function(_res) {

            var ip = _res[0].current_ip;
            
            var username = config.getNodesAuth()['username'];
            var password = config.getNodesAuth()['password'];

            u.getLogger().network('server is asking /data/get/uidString to '+ip);

            var options = {
                timeout: 1000,
                url: 'http://'+ip+'/data/get/uidString'
            };

            request(options,
                function (error, response, body){
                    if(error) {
                        u.getLogger().error('ERROR WEBPANEL: /api/askTagToDeskNode some error in the request to '+ip+' '+error);
                        res.end(404);
                    }
                    console.log(body);
                    if(!body) {
                        res.end(404);
                    }
                    body = JSON.parse(body);
                    res.json({value: body.value});
                }).auth(username, password);
        });
    });

    app.get('/api/resetMachine', authentication.ensureAuthenticated, function(req, res) {
        model.resetMachine(function(_res) {
            if(_res) {
                res.json({'reset':'ok'}).end(200);
            } else {
                res.end(404);
            }
        });
    });

    app.get('/api/calendar', authentication.ensureAuthenticated, function(req, res) {
        model.getCalendars(function(_res) {
            if(_res) {
                res.json(_res).end(200);
            } else {
                res.end(400);
            }
        });
    });

    app.get('/api/calendar/:group', authentication.ensureAuthenticated, function(req, res) {
        var group_id = req.params.group;
        model.getCalendar(group_id, function(_res) {
            if(_res) {
                res.json(_res).end(200);
            } else {
                res.end(400);
            }
        });
    });

    app.post('/api/calendar/add', authentication.ensureAuthenticated, function(req, res) {
        var group_id = req.body.group_id,
            node_id = req.body.node_id,
            day = req.body.day,
            start = req.body.start,
            end = req.body.end;

        model.addCalendar(group_id, node_id, day, start, end, function(_res) {
            if(!_res) {
                res.send(400);    
            }
            res.json(_res).end(200);
        });
    });

    app.post('/api/calendar/modify', authentication.ensureAuthenticated, function(req, res) {
        console.log('/api/calendar/modify', req.body);
        var calendar_id = req.body.calendar_id,
            group_id = req.body.group_id,
            node_id = req.body.node_id,
            day = req.body.day,
            start = req.body.start,
            end = req.body.end;

        model.modifyCalendar(calendar_id, group_id, node_id, day, start, end, function(_res) {
            if(!_res) {
                res.send(400);    
            }
            res.json(_res).end(200);
        });
    });

    app.delete('/api/calendar/id/:id', authentication.ensureAuthenticated, function(req, res) {
        var calendar_id = req.params.id;
        model.deleteCalendar(calendar_id, function(_res) {
            if(!_res) {
                res.send(400);    
            }
            res.json(_res).end(200);
        })
    });
}