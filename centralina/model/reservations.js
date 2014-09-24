var dblite = require('dblite'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js'),
    schema = require(__dirname+'/schemas.js');

module.exports = function(super_module){


    super_module.getReservationById = function(id, callback) {
        var query = 'SELECT * FROM Reservation WHERE reservation_id='+id+';';
        u.getLogger().db(query);

        db.query(query, schema.ReservationSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getReservationByID: '+err);
                callback([]);
                return;
            }
            //console.log(rows);
            callback(rows);
        });
    };

    super_module.getReservations = function(callback) {
        var query = 'SELECT * FROM Reservation;';
        u.getLogger().db(query);

        db.query(query, schema.ReservationSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getReservations: '+err);
                callback([]);
                return;
            }
            //console.log(rows);
            callback(rows);
        });
    };

    // TODO: check user exists
    // TODO: check node exists
    // TODO: check start is valid start time (in the future)
    // TODO: check expected duretion is valid duration time (in hours)
    super_module.addReservation = function(user_id, node_id, expected_start, expected_duration, callback) {
        var params = [
            parseInt(user_id), 
            parseInt(node_id), 
            parseInt(expected_start), 
            -1, 
            parseInt(expected_duration), 
            -1, 
            0];
        var query = 'INSERT INTO "Reservation" VALUES( '+
                    '(SELECT max(reservation_id)+1 FROM "Reservation"), '+
                    params.join(', ')+');';
        u.getLogger().db(query);
        
        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > addReservation: '+err);

                callback(false);
            } else {
                query = 'SELECT max(reservation_id) FROM "Reservation"';
                db.query(query, function(err, rows) {
                    if(err) {
                        console.log('model.js > addReservation > inner > ... db error ...'+err);
                        callback(false);
                    } else {
                        callback(rows[0]);
                    }
                });
            }
        });
    };

    super_module.deleteReservation = function(reservation_id, callback) {
        var query = 'DELETE FROM "Reservation" WHERE "reservation_id"='+reservation_id+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > deleteReservation: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.modifyReservation = function(reservation_id, user_id, node_id, expected_start, 
                                actual_start, expected_duration, actual_duration, 
                                active, callback) {

        var query = 'UPDATE Reservation SET user_id="'+user_id+'"'+
                                         ', node_id='+node_id+
                                         ', expected_start='+expected_start+
                                         ', actual_start='+actual_start+
                                         ', expected_duration='+expected_duration+
                                         ', actual_duration='+actual_duration+
                                         ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > modifyReservation: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.modifyOrInsertReservation = function(reservation_id, user_id, node_id, expected_start, 
                                        actual_start, expected_duration, actual_duration, 
                                        active, callback) {
        var query = 'INSERT OR REPLACE INTO Reservation (reservation_id, '+
                                                        'user_id, '+
                                                        'node_id, '+
                                                        'expected_start, '+
                                                        'expected_duration, '+
                                                        'actual_duration, '+
                                                        'active) '+
                    'VALUES ( '+reservation_id+','
                               +user_id+','
                               +node_id+','
                               +expected_start+','
                               +expected_duration+','
                               +actual_duration+','
                               +active+');';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > modifyOrInsertReservation: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.setReservationActualDuration = function(reservation_id, actual_duration, callback) {
        var query = 'UPDATE Reservation SET actual_duration='+actual_duration+
                                         ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > setReservationActualDuration: '+err);

                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.setReservationActive = function(reservation_id, active, callback) {
        var query = 'UPDATE Reservation SET active='+active+
                    ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > setReservationActive: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.setReservationActualStartTime = function(reservation_id, actual_start, callback) {
        var query = 'UPDATE Reservation SET actual_start='+actual_start+
                    ' WHERE reservation_id='+parseInt(reservation_id)+';';
        u.getLogger().db(query);

        db.query(query, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > setReservationActualStartTime: '+err);
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    super_module.askReservation = function(timestamp, tagValue, nodeId, callback) {
        var query = '';
        query = 'SELECT * FROM Reservation WHERE '+
                '("'+timestamp+'" BETWEEN expected_start AND (expected_start+expected_duration)) AND'+
                ' User_Id = (SELECT User_Id FROM Tag WHERE Value="'+tagValue+'") AND'+
                ' Node_Id = "'+nodeId+'";'
        u.getLogger().db(query);
        
        db.query(query, function(err, rows) {
            
            if(err) {
                //console.log('    > ERROR: '+err);
                u.getLogger().error('models.js > askReservation > error: '+err);
                callback('n'); 
                return;
            }

            switch(rows.length) {
                case 0: 
                    console.log('    > NO, response: '+rows);
                    callback('n'); 
                    break;
                case 1: 
                    console.log('    > YES, response: '+rows);
                    callback('y'); 
                    break;
                default:
                    callback('n');
                    break;
            }
        });
    };

}