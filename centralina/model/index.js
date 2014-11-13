var groups = require(__dirname+'/groups.js');
var users = require(__dirname+'/users.js');
var tags = require(__dirname+'/tag.js');
var machines = require(__dirname+'/machines.js');
var reservations = require(__dirname+'/reservations.js');
var calendars = require(__dirname+'/calendars.js');

var dblite = require('dblite').withSQLite('3.8.6+'),
    db = dblite(__dirname+'/db/database.db');


module.exports = function(){

    groups(this, db);
    users(this, db);
    tags(this, db);
    machines(this, db);
    reservations(this, db);
    calendars(this, db);

    return this;
}();