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

    super_module.addMachine = function(machine_id, current_ip, callback) {
        current_ip = '"'+current_ip+'"';
        var params = [machine_id, current_ip, u.getNow(), 0, 1];

        var query = 'INSERT INTO "Node" VALUES( '+params.join(', ')+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > addMachine: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.deleteMachine = function(machine_id) {
        var query = 'DELETE FROM "Node" WHERE "node_id"='+machine_id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > deleteMachine: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    // TODO: check on ip already exists
    // TODO: check on id already exists
    super_module.modifyMachine = function(machine_id, current_ip, last_seen, status, type, active, callback) {
        var query = 'INSERT OR REPLACE INTO '+
                    'Node (node_id, current_ip, date_last_seen, status, type, active)'+
                    ' VALUES ('+machine_id+', "'+current_ip+'",'+
                    last_seen+', '+status+', "'+type+'", '+active+');';

        // var query = 'UPDATE Node SET current_ip="'+current_ip+'"'+
        //                           ', date_last_seen='+last_seen+
        //                           ', status='+status+
        //                           ', active='+active+
        //                         ' WHERE node_id='+parseInt(machine_id)+';';
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