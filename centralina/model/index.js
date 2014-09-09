var groups = require(__dirname+'/groups.js');
var users = require(__dirname+'/users.js');
var tags = require(__dirname+'/tag.js');
var machines = require(__dirname+'/machines.js');
var reservations = require(__dirname+'/reservations.js');
var calendars = require(__dirname+'/calendars.js');

module.exports = function(){

    groups(this);
    users(this);
    tags(this);
    machines(this);
    reservations(this);
    calendars(this);

    return this;
}();