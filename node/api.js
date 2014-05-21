module.exports = function(params){

    var dblite = require('dblite'),
        db = dblite('test.db'),
        http = require('http'),
        app = params.app;

    //---------------------------------------------------------------------------------- USERS
    /********************************

    get /api/users
    post /api/users/add
    get /api/users/:user-id
    put /api/users/:id
    delete /api/users/:user-id

    ********************************/

    app.get('/api/users', function(req, res) {
        db.query('SELECT * FROM Users', function(err, rows) {
            res.json( buildUserFromRow(rows) );
        });
    });

    app.post('/api/users/add', function(req, res) {
        db.query('SELECT max(User_Id)+1 FROM "Users";', function(err, rows) {
            var i = rows[0][0];
            var query = 'INSERT INTO Users VALUES('+i+', "'+req.body.userName+'", '+req.body.active+');';
            db.query(query, function(err, rows) {
                res.send(200);
                res.end();
            });
        });
    });

    app.get('/api/users/:user_id', function(req, res) {
        var id = req.params.user_id.split('user-')[1];
        db.query('SELECT * FROM Users WHERE User_Id='+id+';', function(err, rows) {
            //console.log(rows);
            res.json( rows ? buildUserFromRow(rows) : [] );
            //res.json( rows );
        });
    });

    app.delete('/api/users/:user_id', function(req, res) {
        var id = req.params.user_id.split('user-')[1];
        var query = 'DELETE FROM Users WHERE User_Id='+id+';';
        //console.log(query);
        db.query(query, function(err, rows) {
            if(err) {
                console.error("app.delete---> /api/users/:id ERROR:"+ err.toString());
                // TODO: error handling
            } else {
                res.send(200);
                res.end();
            }
        });
    });

    app.put('/api/users/:id', function (req, res) {
        console.log(req.body);
        var query = 'UPDATE Users SET Name="'+req.body.userName+'", Active="'+req.body.active+'" WHERE User_Id='+req.body.userId+';';
        db.query(query, function(err, rows) {
            if(err) {
                console.error("app.put---> /api/users/:id ERROR:"+err.toString());
                console.log(query);
                // TODO: error handling
            } else {
                res.send(200);
                res.end();
            }
        });
    });

    function buildUserFromRow(rows) {
        var users = [];
        for (var i = 0; i < rows.length; ++i) {
            var user = {}
            user['id'] = rows[i][0];
            user['name'] = rows[i][1];
            user['active'] = rows[i][2]==1 ? true : false; 
            users.push(user);
        };
        return users;
    }

    //---------------------------------------------------------------------------------- TAG
    /********************************

    get /api/tag/user
    post /api/tag/add
    get /api/tag/read/0   <------- read the tag json from node #0

    ********************************/

    app.get('/api/tag/:user_id', function(req, res) {

        var user_id = req.params.user_id.split('user-')[1];
        
        if( isNaN(parseInt(user_id)) ) {
            res.json([]);
            res.send(200);
            res.end();
            return;
        }

        var query = 'SELECT * FROM Tag WHERE User_Id='+user_id+';';
        //console.log(query);
        db.query(query, function(err, rows) {
            if(err) {
                console.error("app.get---> /api/tag/:user_id ERROR:"+err.toString());
                // TODO: error handling
            } else {
                var tags = [];
                for (var i = 0; i < rows.length; ++i) {
                    var tag = {}
                    tag['id'] = rows[i][0];
                    tag['user_id'] = rows[i][1];
                    tag['type'] = rows[i][2];
                    tag['value'] = rows[i][3];
                    tags.push(tag);
                };
                res.json(tags);
                res.send(200);
                res.end();
             }
        });
    });

    app.post('/api/tag/add', function(req, res){
        db.query('SELECT max(Tag_Id)+1 FROM "Tag";', function(err, rows) {
            var i = rows[0][0];
            var query = 'INSERT INTO Tag VALUES('+i+', "'+req.body.userId+'", "'+req.body.type+'", "'+req.body.value+'");';
            console.log(query);
            db.query(query, function(err, rows) {
                if(err) {
                    console.log(err, query);
                    res.send(404); res.end();
                    return;
                }
                res.send(200);
                res.end();
            });
        });
    });

    app.get('/api/tag/read/:node_id', function(req, res) {
        // get the tag value from bridge
        console.log('should ask the tag type to bridge..');

        var options = {
            host: '192.168.1.10',
            port: 80,
            path: '/arduino/read',
            auth: 'root:wemakemilano!'
        };

        console.log(options);

        var request = http.get(options, function(htres){
            var body = "";
            htres.on('data', function(data) {
                body += data;
            });
            htres.on('end', function() {
                //console.log('/api/tag/read/:node_id > receiving data from '+options.host+': '+ body);
                body = JSON.parse(body);
                res.json(body);
                res.end();
            })
            htres.on('error', function(e) {
                console.log("app.get---> /api/tag/read/:node_id ERROR: " + e.message);
            });
        });
        

    });

    //---------------------------------------------------------------------------------- CHECK-IN CHECK-OUT
    /********************************

    get /api/checkin/:tagval/:duration/, answer y/n

    ********************************/

    app.get('/api/checkin/:tagval/:duration/:nodeid', function(req, res) {

        console.log('app.get---> /api/checkin/:tagval/:duration/:nodeid\n'+
                    '            /api/checkin/'+req.params.tagval+'/'+req.params.duration+'/'+req.params.nodeid+'\n'+
                    '            from '+req.connection.remoteAddress);


        function paddy(n, p, c) {
            var pad_char = typeof c !== 'undefined' ? c : '0';
            var pad = new Array(1 + p).join(pad_char);
            return (pad + n).slice(-pad.length);
        }

        var now = new Date();
        var timestamp_sql_format = '';
        timestamp_sql_format += now.getFullYear()+'-';
        timestamp_sql_format += paddy(now.getMonth(), 2)+'-';
        timestamp_sql_format += paddy(now.getDate(), 2)+' ';
        timestamp_sql_format += paddy(now.getHours(), 2)+':';
        timestamp_sql_format += paddy(now.getMinutes(), 2);

        var query = '';
        query = 'SELECT * FROM Reservation WHERE '+
                '("'+timestamp_sql_format+'" BETWEEN Start AND End) AND'+
                ' User_Id = (SELECT User_Id FROM Tag WHERE Value="'+req.params.tagval+'") AND'+
                ' Node_Id = "'+req.params.nodeid+'";'
        console.log(query);
        db.query(query, function(err, rows) {
            //console.log(rows);
            switch(rows.length) {
                case 0: res.send('n').status(404).end(); break;
                case 1: res.send('y').status(200).end(); break;
                default:
                    console.log('appe.get---> /api/checkin/:tagid/:duration/:timestamp ERROR:\n'+
                                'database shoud respond 0/1 instad is: '+ rows.length);
            }
        });
    });
}