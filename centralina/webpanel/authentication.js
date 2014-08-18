//----------------------------------------------------------- declarations and import

var crypto = require('crypto'),
    passport = require('passport'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    localStrategy = require('passport-local').Strategy,
    flash = require('connect-flash'),
    passport = require('passport');

var rootPath = require('path').dirname(require.main.filename),
    config = require(rootPath+'/config'),
    u = require(rootPath+'/utils.js');

//----------------------------------------------------------- the local strategy

var localStrategy = new localStrategy( function(username, password, done) {
    //console.log('authentication.js > init local strategy.');

    var auth = config.getLocalAuth();
    if(username==auth.username && password==auth.password) {
        //console.log('authentication.js > done!');
        done(null, {'authentication':'true', 'role':'ADMIN'});
    } else {
        //console.log('authentication.js > Incorrect credentials!');
        done(null, false, { message: 'Incorrect credentials.' });
    }
});

//----------------------------------------------------------- user serialization

function serializeUser(user, done) {
    done(null, 0);
};
exports.serializeUser = serializeUser;

function deserializeUser(id, done) {
    //console.log('authentication.js > deserializeUser > id:'+id);
    done(null, {'authentication':'true'});
};
exports.deserializeUser = deserializeUser;

//----------------------------------------------------------- login logout

function login(req, res, next) {
    return passport.authenticate('local', function(err, user) {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      if (err) {
        return next(err);
        }
        if (!user) {
            u.getLogger().login(ip+' asking '+req.originalUrl+' > login bad username or password.');
            return res.send(401, {message: 'Bad username or password'});
        }

        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            //u.getLogger().login(ip+' asking '+req.originalUrl+' > login ok.');
            res.json(200, user);
        });

    })(req, res, next);
};
exports.login = login;

function logout(req, res) {
    req.logout();
    return res.send(200);
};
exports.logout = logout;

//----------------------------------------------------------- API protection

function ensureAuthenticated(req, res, next) {
    //console.log('authentication.js > Calling: ensureAuthenticated..... '+req.isAuthenticated());
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (req.isAuthenticated()) {
        //console.log('authentication.js > ensureAuthenticated logged.');
        //u.getLogger().login(ip+' asking '+req.originalUrl+' > ensureAuthenticated logged.');
        return next();
    } else {
        //console.log('authentication.js > ensureAuthenticated invalid credentials.');
        //u.getLogger().login(ip+' asking '+req.originalUrl+' > ensureAuthenticated invalid credentials.');
        return res.send(401);
    }
};
exports.ensureAuthenticated = ensureAuthenticated;

//----------------------------------------------------------- init passport thing

function init(app, passport) {
    app.use(cookieParser()); // read cookies (needed for auth)
    app.use(expressSession({secret: 'secretterces'}));
    app.use(passport.initialize());
    app.use(passport.session({ secret: 'secretterces' })); // session secret
    app.use(flash()); // use connect-flash for flash messages stored in session
    passport.use(localStrategy);
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);
}


exports.setup = function(app) {
    init(app, passport);

    var authentication = {
        ensureAuthenticated: ensureAuthenticated,
        login: login,
        logout: logout
    }
}