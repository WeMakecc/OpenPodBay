var dblite = require('dblite').withSQLite('3.8.6+'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js'),
    schema = require(__dirname+'/schemas.js');

module.exports = function(super_module){

    super_module.getGroups = function(callback) {
        var query = 'SELECT * FROM Groups';
        u.getLogger().db(query);

        db.query(
            query, 
            schema.GroupSchema, 
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > getGroups: '+err);
                    callback([]);
                    return;
                }
                callback(rows);
            }
        );
    };

    super_module.addGroup =  function(groupName, callback) {
        var params = [groupName];
        var query = 'INSERT INTO Groups VALUES( (SELECT max(group_id)+1 FROM Groups), ?);';
        u.getLogger().db(query+' '+params);
        db.query(
            query, 
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > addGroup: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.getGroup = function(groupName, callback) {
        var params = [groupName];
        var query = 'SELECT * FROM Groups WHERE groupname = ?';
        u.getLogger().db(query);
        db.query(
            query, 
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > getGroup: '+err);
                    callback(false);
                } else {
                    callback(rows);
                }
            }
        );
    };

}