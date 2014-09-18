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

    super_module.addCalendar = function(group_id, node_id, day, start, end, callback) {
        console.log('dudee',group_id, node_id, day, start, end);

        var query = 'INSERT INTO "Calendar" VALUES( (SELECT max(calendar_id)+1 FROM "Calendar"), '+
                                                    group_id+', '+
                                                    node_id+', '+
                                                    '"'+day+'"'+', '+
                                                    '"'+start+'"'+', '+
                                                    '"'+end+'"'+', '+
                                                    '1);';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > addCalendar: '+err);
                callback(-1);
            } else {
                var _query = 'SELECT calendar_id FROM "Calendar" WHERE calendar_id=(SELECT max(calendar_id) FROM "Calendar");'
                db.query(_query, function(_err, _rows) {
                    callback(_rows[0]);
                });
            }
        });
    }

    super_module.modifyCalendar = function(calendar_id, group_id, node_id, day, start, end, callback) {

        var query = 'UPDATE Calendar SET '+
                                        'group_id = '+group_id+', '+
                                        'node_id = '+ node_id+', '+
                                        'day = "'+ day +'", '+
                                        'start = "'+start+'", '+
                                        'end = "'+end+'" '+
                                     ' WHERE calendar_id = '+calendar_id+';'; 

        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > modifyCalendar: '+err);
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
            dayOfTheWeek = days[d.getDay()-1],
            stamp = d.getMinutes()*60 + d.getHours()*3600;

        var query = 'SELECT * FROM Calendar WHERE start<time("now") AND time("now")<end AND '+
                                                  'node_id='+node_id+' AND '+
                                                  'group_id='+group_id+' AND '+
                                                  'day="'+dayOfTheWeek+'";';
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