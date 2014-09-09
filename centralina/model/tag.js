var dblite = require('dblite'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js'),
    schema = require(__dirname+'/schemas.js');

module.exports = function(super_module){

    super_module.addTag = function(user_id, tag_type, tag_value, callback) {
        var params = [user_id, tag_type, tag_value, 1]
                        .map(function(s){return '"'+s+'"';});

        var query = 'INSERT INTO "Tag" VALUES( (SELECT max(tag_id)+1 FROM "Tag"), '+params.join(', ')+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > addTag: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.setTagActive = function(tag_value, active, callback) {
        var query = 'UPDATE Tag SET active='+active+
                    ' WHERE value="'+tag_value+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > setTagActive: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.deleteTagByValue = function(tag_value, callback) {
        var query = 'DELETE FROM "Tag" WHERE "value"="'+tag_value+'";';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > deleteTagByValue: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.findUserByTagValue = function(tag_value, callback) {
        var query = 'SELECT * FROM User WHERE user_id ='+
                    '(SELECT user_id From Tag WHERE value = "'+tag_value+'");';
        u.getLogger().db(query);

        db.query(query, schema.UserSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > findUserByTagValue: '+err);
                callback(false);
            } else {
                callback(rows);
            }
        });  
    };

    super_module.findTagByUsername = function(username, callback) {
        var query = 'SELECT * FROM Tag WHERE user_id = '+
                    '(SELECT user_id FROM User WHERE username="'+username+'");';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > findTagByUsername: '+err);
                callback(false);
            } else {
                callback(rows);
            }
        });
    };

    super_module.findTagById = function(id, callback) {
        var query = 'SELECT * FROM Tag WHERE user_id = '+id+';';
        u.getLogger().db(query);

        db.query(query, schema.TagSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > findTagById: '+err);
                callback(false);
            } else {
                callback(rows);
            }
        });
    };

}