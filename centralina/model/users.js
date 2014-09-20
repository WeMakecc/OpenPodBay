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
        var query = 'SELECT * FROM User WHERE user_id='+user_id+';';
        u.getLogger().db(query);

        db.query(query, schema.UserSchema, function(err, rows) {
            if(err) {
              u.getLogger().db('error','DB error: model.js > getUser: '+err);
              callback([]);
            }
            callback(rows);
        })
    };

    super_module.addUser = function(username, group, status, credits, callback) {
        var params = [username, group, status, credits, 1]
                        .map(function(s){return '"'+s+'"';});

        var query = 'INSERT INTO "User" VALUES( (SELECT max(user_id)+1 FROM "User"), '+params.join(', ')+');';
        u.getLogger().db(query);

        db.query('INSERT INTO "User" VALUES( (SELECT max(user_id)+1 FROM "User"), ?, ?, ?, ?, ?);'
            , [username, group, status, credits, 1],
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

    super_module.deleteUserByUsername = function(username, callback) {
        var query = 'DELETE FROM "User" WHERE "username"="'+username+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > deleteUserByUsername: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.deleteUserById = function(id, callback) {
        var query = 'DELETE FROM "User" WHERE "user_id"="'+id+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > deleteUserById: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.modifyUser = function(id, username, group_id, status, credits, active, callback) {
        var query = 'UPDATE User SET username="'+username+
                                  '", group_id="'+group_id+
                                  '", status="'+status+
                                  '", credits="'+credits+
                                  '", active="'+active+'" WHERE user_id='+id+';';
        u.getLogger().db(query);

        var querydata = {
            user_id: id,
            username: username,
            group_id: group_id,
            status: status,
            credits: credits,
            active: active
        };
        console.log(querydata);

        db.query('UPDATE User SET username=$username, group_id=$group_id, status=$status, credits=$credits, active=$active '+
                 'WHERE user_id=$user_id',
        {
            user_id: id,
            username: username,
            group_id: group_id,
            status: status,
            credits: credits,
            active: active
        }, 
        function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > modifyUser: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
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
            var query = 'INSERT OR REPLACE INTO User (user_id, username, group_id, status, credits, active) '+
                        'VALUES ( '+user_id+','
                                   +'"'+username+'"'+','
                                   +'(SELECT group_id FROM Groups WHERE groupname="'+group+'")'+','
                                   +status+','
                                   +credits+','
                                   +active+');'
            u.getLogger().db(query);

            db.query(
                'INSERT OR REPLACE INTO User (user_id, username, group_id, status, credits, active) ' +
                'VALUES ($user_id, $username, (SELECT group_id FROM Groups WHERE groupname=$group), $status, $credits, $active)',
                {
                    user_id: user_id,
                    username: username,
                    group: group,
                    status: status,
                    credits: credits,
                    active: active
                }, function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > modifyOrInsertUser: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            });
        }
    };

    super_module.setUserName = function(id, username, callback) {
        var query = 'UPDATE User SET username="'+username+
                    '" WHERE user_id='+id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > setUserName: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.findUserByUsername = function (username, callback) {
        var rowType = {
            id: Number,
            username: String,
            group: String
        };
        var query = 'SELECT * FROM User WHERE username = "'+username+'";';
        u.getLogger().db(query);

        db.query(query, rowType, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > findUserByUsername: '+err);
                callback(false);
            } else {
                console.log('model > findUserByUsername: '+rows[0]);
                callback(rows[0]);
            }
        });
    };

    super_module.findUserById = function (user_id, callback) {
        var rowType = {
            id: Number,
            salt: String,
            group: String
        };
        var query = 'SELECT * FROM User WHERE user_id = "'+user_id+'";';
        u.getLogger().db(query);

        db.query(query, rowType, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > findUserById: '+err);
                callback(false);
            } else {
                callback(rows[0]);
            }
        });
    };

}