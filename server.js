var dblite = require('dblite'),
    db = dblite('test.db');

var express = require('express'),
    bodyParser = require('body-parser');
    app = express();
    
app.use(bodyParser())
//app.use(app.router);

/********************************

get /
get /version

********************************/

app.get('/', function(req, res) {
    res.send('Hello');
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
    res.render('userslist.ejs', { resources_url: getURL(req)+'/view',
                                  api_url: getURL(req)+'/api' });
});

app.get('/view/users/add', function(req, res, next){
    res.render('adduser.ejs', { resources_url:getURL(req)+'/view',
                                api_url: getURL(req)+'/api' });
});

app.get('/view/users/:id', function(req, res, next){
    res.render('user.ejs', { resources_url:getURL(req)+'/view',
                             api_url: getURL(req)+'/api',
                             id: req.params.id });
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
        var users = [];
        for (var i = 0; i < rows.length; ++i) {
            var user = {}
            user['id'] = rows[i][0];
            user['name'] = rows[i][1];
            users.push(user);
        };
        res.json(users);
    });
});

app.post('/api/users/add', function(req, res) {
    
    db.query('SELECT max(User_Id)+1 FROM "Users";', function(err, rows) {
        var i = rows[0][0];
        
        db.query('INSERT INTO Users VALUES('+i+', "'+req.body.userName+'");', function(err, rows) {
            console.log('dudee');
            res.send(200);
            res.end();
        });
    });
});

app.get('/api/users/:id', function(req, res) {
    db.query('SELECT * FROM Users WHERE User_Id='+req.params.id+';', function(err, rows) {
        var users = [];
        for (var i = 0; i < rows.length; ++i) {
            var user = {}
            user['id'] = rows[i][0];
            user['name'] = rows[i][1];
            users.push(user);
        };
        res.json(users);
    });
});

app.delete('/api/users/:id', function(req, res) {
    db.query('DELETE FROM Users WHERE User_Id='+req.params.id+';', function(err, rows) {
        if(err) {
            console.error(err.toString());
            // TODO: error handling
        } else {
            res.send(200);
            res.end();
        }
    });
});

app.put('/api/users/:id', function (req, res) {
    console.log(req.data);
    console.log(req.params);
    console.log(req.body);

    var query = 'UPDATE  Users SET Name="'+req.body.userName+'" WHERE User_Id='+req.body.userId+';';
    console.log(query);
    db.query(query, function(err, rows) {
        if(err) {
            console.error(err.toString());
            // TODO: error handling
        } else {
            res.send(200);
            res.end();
        }
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