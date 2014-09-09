var dblite = require('dblite'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js'),
    schema = require(__dirname+'/schemas.js');

var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

module.exports = function(super_module){

    super_module.getCalendars = function(callback) {
        var query = '';
        query = 'SELECT * FROM Calendar;';
        u.getLogger().db(query);

        db.query(query, schema.CalendarSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getCalendars: '+err);
                callback([]);
            }
            callback(rows);
        });
    };

    super_module.getCalendar = function(group_id, callback) {
        var query = '';
        query = 'SELECT * FROM Calendar WHERE group_id='+group_id+';';
        u.getLogger().db(query);

        db.query(query, schema.CalendarSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getCalendar: '+err);
                callback([]);
            }
            callback(rows);
        });
    };

    // insertOrModifyCalendar(calendar_id, group_id, node_id, day, start, end, active, function(_res) 
    super_module.modifyOrInsertCalendar = function(calendar_id, group_id, node_id, day, start, end, active, callback) {

        var query = 'INSERT OR REPLACE INTO Calendar (calendar_id, '+
                                        'group_id, '+
                                        'node_id, '+
                                        'day, '+
                                        'start, '+
                                        'end, '+
                                        'active) '+
        'VALUES ( '+calendar_id+','
                   +group_id+','
                   +node_id+','
                   +'"'+day+'"'+','
                   +start+','
                   +end+','
                   +active+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > modifyOrInsertCalendar: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });

    };

    super_module.deleteCalendar = function(calendar_id, callback) {
        var query = 'DELETE FROM "Calendar" WHERE "calendar_id"='+calendar_id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > deleteCalendar: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.askCalendar = function(group_id, node_id, now, callback) {
        var d = new Date(now*1000),
            dayOfTheWeek = days[d.getDay()],
            stamp = d.getSeconds() + d.getMinutes()*60 + d.getHours()*3600;

        var query = 'SELECT * FROM Calendar WHERE node_id='+node_id+' AND '+
                                                 'group_id='+group_id+' AND '+
                                                 'start < '+stamp+' AND '+
                                                 'end > '+stamp+';';
        u.getLogger().db(query);
        
        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > askCalendar: '+err);
                callback(false);
            } else {
                callback( rows.length>0 );
            }
        })                                        
    };

}