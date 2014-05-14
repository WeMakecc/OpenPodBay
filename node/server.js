var dblite = require('dblite'),
    db = dblite('test.db');

var http = require('http');

var express = require('express'),
    bodyParser = require('body-parser');
    app = express();

app.use(bodyParser());

/********************************

get /
get /version

********************************/

app.get('/', function(req, res) {
    res.send('Hello');ghf
});

app.get('/version', function(req, res) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write('version..<br/>');
    res.write('V8: '+process.version.v8+'<br/>');
    res.write('Node: '+process.version+'<br/>');
    res.write('Express: '+'TODO'+'<br/>');
    res.write('DbLite: '+'TODO'+'<br/>');
    res.end();
});

/********************************

get /view/users
get /view/users/:id
get /view/users/add

********************************/

// access css from /view/style.css
app.use('/view', express.static(__dirname + '/public'));

app.get('/view/users', function(req, res) {
    res.render('userslist.ejs', { 
        resources_url: getURL(req)+'/view',
        api_url: getURL(req)+'/api' 
    });
});

app.get('/view/users/add', function(req, res, next){
    res.render('adduser.ejs', { 
        resources_url:getURL(req)+'/view',
        api_url: getURL(req)+'/api' 
    });
});

app.get('/view/users/:id', function(req, res, next){
    res.render('user.ejs', {   
        resources_url:getURL(req)+'/view',
        api_url: getURL(req)+'/api',
        id: req.params.id
    });
});

/********************************

get /api/users
post /api/users/add
get /api/users/:id
put /api/users/:id
delete /api/users/:id

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

app.get('/api/users/:id', function(req, res) {
    db.query('SELECT * FROM Users WHERE User_Id='+req.params.id+';', function(err, rows) {
        //console.log(rows);
        res.json( rows ? buildUserFromRow(rows) : [] );
        //res.json( rows );
    });
});

app.delete('/api/users/:id', function(req, res) {
    db.query('DELETE FROM Users WHERE User_Id='+req.params.id+';', function(err, rows) {
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
    var query = 'UPDATE Users SET Name="'+req.body.userName+'", Active="'+req.body.active+'" WHERE User_Id='+req.body.userId+';';
    db.query(query, function(err, rows) {
        if(err) {
            console.error("app.put---> /api/users/:id ERROR:"+err.toString());
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

/********************************

get /api/tag/user
post /api/tag/add
get /api/tag/read/0   <------- read the tag json from node #9

********************************/

app.get('/api/tag/:user_id', function(req, res) {
    if(!parseInt(req.params.user_id)){
        res.json([]);
        res.send(200);
        res.end();
        return;
    }

    var query = 'SELECT * FROM Tag WHERE User_Id='+req.params.user_id+';';
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
        //console.log(query);
        db.query(query, function(err, rows) {
            res.send(200);
            res.end();
        });
    });
});

app.get('/api/tag/read/:node_id', function(req, res) {
    // get the tag value from bridge
    console.log('should ask the tag type to bridge..');

    var options = {
        host: '192.168.1.20',
        port: 80,
        path: '/arduino/read',
        auth: 'root:wemakemilano!'
    };

    var request = http.get(options, function(htres){
        var body = "";
        htres.on('data', function(data) {
            body += data;
        });
        htres.on('end', function() {

            body = JSON.parse(body);
            res.json(body);
            res.end();
        })
        htres.on('error', function(e) {
            console.log("app.get---> /api/tag/read/:node_id ERROR: " + e.message);
        });
    });
    

});

/********************************

start the server

********************************/

var port = 3000;

function getURL(req) {
    return req.protocol+'://'+req.get('host');
}

var server = app.listen(port, function() {
    console.log('Listening on port %d', server.address().port);
});