var dblite = require('dblite'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js'),
    schema = require(__dirname+'/schemas.js');

module.exports = function(super_module){

    super_module.getUsers = function(callback) {
        var query = 'SELECT * FROM User';
        u.getLogger().db(query);

        db.query(query, schema.UserSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getUsers: '+err);
                callback([]);
            }
            callback(rows);
        })
    };

    super_module.getUser = function(user_id, callback) {
        var params = [user_id];
        var query = 'SELECT * FROM User WHERE user_id = ?';
        u.getLogger().db(query+' '+params);

        db.query(
            query, 
            params,
            schema.UserSchema, 
            function(err, rows) {
                if(err) {
                  u.getLogger().db('error','DB error: model.js > getUser: '+err);
                  callback([]);
                }
                callback(rows);
            }
        );
    };

    super_module.addUser = function(username, group, status, credits, callback) {
        var params = [username, group, status, credits, 1];

        var query = 'INSERT INTO User VALUES( (SELECT max(user_id)+1 FROM User), '+
                                             '?, ?, ?, ?, ?)';
        u.getLogger().db(query+' '+params);

        db.query(
            query,
            params, 
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > addUser: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.deleteUserById = function(id, callback) {
        var params = [id];
        var query = 'DELETE FROM User WHERE user_id = ?';
        u.getLogger().db(query+' '+params);

        db.query(
            query, 
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > deleteUserById: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.modifyUser = function(id, username, group_id, status, credits, active, callback) {
        var params = [username, group_id, status, credits, active, id];
        var query = 'UPDATE User SET username = ?, group_id = ?, '+
                                    'status = ?, credits = ?, '+
                                    'active = ? WHERE user_id = ?';
        u.getLogger().db(query+' '+params);

        db.query(
            query,
            params, 
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > modifyUser: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.modifyOrInsertUser = function(user_id, username, group, status, credits, active, callback) {

        var that = this;

        // first get the group, then update the user
        that.getGroup(group, function(g) {
            if(g.length==0) {
                that.addGroup(group, _updateUser);
            } else {
                _updateUser();
            }
        })

        function _updateUser() {
            var params = {
                user_id: user_id,
                username: username,
                group: group,
                status: status,
                credits: credits,
                active: active
            };
            var query = 'INSERT OR REPLACE INTO User (user_id, username, group_id, status, credits, active) ' +
                'VALUES ($user_id, $username, (SELECT group_id FROM Groups WHERE groupname=$group), $status, $credits, $active)';
            u.getLogger().db(query+' '+params);

            db.query(
                query,
                params,
                function(err, rows) {
                    if(err) {
                        u.getLogger().db('error','DB error: model.js > modifyOrInsertUser: '+err);
                        callback(false);
                    } else {
                        callback(true);
                    }
                }
            );
        }
    };

    super_module.setUserName = function(id, username, callback) {
        var params = [username, id];
        var query = 'UPDATE User SET username = ? +'
                    'WHERE user_id = ?';
        u.getLogger().db(query);

        db.query(
            query,
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > setUserName: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

}