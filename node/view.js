function getURL(req) {
    return req.protocol+'://'+req.get('host');
}

module.exports = function(params){

     var app = params.app,
         express = params.express;

    /********************************

    get /view/users
    get /view/users/:id
    get /view/users/add

    ********************************/

    // access css from /view/style.css
    app.use('/view', express.static(__dirname + '/views'));

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
            id: req.params.id.split('user-')[1]
        });
    });

    /********************************

    get /view/machines
    
    ********************************/

    app.get('/view/machines', function(req, res) {
        res.render('machineslist.ejs', {
            resources_url: getURL(req)+'/view',
            api_url: getURL(req)+'/api'
        })
    });
}