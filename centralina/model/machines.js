var dblite = require('dblite'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js'),
    schema = require(__dirname+'/schemas.js');

module.exports = function(super_module){

    super_module.getMachines = function(callback) {
        var query = 'SELECT * FROM Node';
        u.getLogger().db(query);

        db.query(query, schema.NodeSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getMachines: '+err);
                callback([]);
            }
            callback(rows);
        })
    };

    super_module.addMachine = function(node_id, current_ip, last_seen, status, active, type, label, callback) {
        var params = [node_id, current_ip, last_seen, status, active, type, label]
                        .map(function(s){return '"'+s+'"';});
        var query = 'INSERT INTO "Node" VALUES( '+params.join(', ')+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > addMachine: '+err);
                callback(true);
            }
            callback(false);
        });

    }

    super_module.getMachine = function(id, callback) {
        var query = 'SELECT * FROM Node WHERE node_id='+id+';'
        u.getLogger().db(query);

        db.query(query, schema.NodeSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getMachine: '+err);
                callback([]);
            }
            callback(rows);
        })        
    };

    // TODO: check on ip already exists
    // TODO: check on id already exists
    super_module.modifyMachine = function(node_id, current_ip, last_seen, status, type, active, callback) {
        var query = 'UPDATE Node '+
                    'SET node_id='+node_id+', '+
                         'current_ip="'+current_ip+'", '+
                         'date_last_seen='+last_seen+', '+
                         'status='+status+', '+
                         'type="'+type+'", '+
                         'active='+active+' '+
                    ' WHERE node_id='+parseInt(node_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > modifyMachine: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.setMachineLabel = function(id_machine, label, callback) {
        var query = 'UPDATE Node SET label = "'+label+'" WHERE node_id='+id_machine+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > setMachineLabel: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    }

    super_module.resetMachine = function(callback) {
        var query = 'DELETE FROM Node;';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {        
            if(err) {
                callback(false);
                return;
            }
            callback(true);
            return;
        });
    };

}