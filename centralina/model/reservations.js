var dblite = require('dblite'),
    db = dblite(__dirname+'/db/database.db'),
    u = require(__dirname+'/../utils.js'),
    schema = require(__dirname+'/schemas.js');

module.exports = function(super_module){

    super_module.getReservations = function(callback) {
        var query = 'SELECT * FROM Reservation;';
        u.getLogger().db(query);

        db.query(query, schema.ReservationSchema, function(err, rows) {
            if(err) {
                u.getLogger().db('error','DB error: model.js > getReservations: '+err);
                callback([]);
                return;
            }
            callback(rows);
        });
    };

    // TODO: check user exists
    // TODO: check node exists
    // TODO: check start is valid start time (in the future)
    // TODO: check expected duretion is valid duration time (in hours)
    /* expected_start, expected_duration in second */
    super_module.addReservation = function(user_id, node_id, expected_start, expected_duration, callback) {
        var params = [user_id, node_id, expected_start, -1, expected_duration, -1, 0];

        var query = 'INSERT INTO Reservation '+
                    'VALUES( (SELECT max(reservation_id)+1 FROM Reservation), '+
                             '?, ?, ?, ?, ?, ?, ?)';
        u.getLogger().db(query, params);
        
        db.query(
            query, 
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > addReservation: '+err);
                    callback(false);
                } else {
                    query = 'SELECT max(reservation_id) FROM "Reservation"';
                    // return the id of the reservation just added
                    db.query(query, function(err, rows) {
                        if(err) {
                            console.log('model.js > addReservation > inner > ... db error ...'+err);
                            callback(false);
                        } else {
                            callback(rows[0]);
                        }
                    });
                }
            } // end callback
        );
    };

    super_module.deleteReservation = function(reservation_id, callback) {
        var query = 'DELETE FROM Reservation WHERE reservation_id = ?';
        u.getLogger().db(query);

        db.query(
            query,
            [reservation_id], 
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > deleteReservation: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.modifyOrInsertReservation = function(reservation_id, user_id, node_id, expected_start, 
                                        actual_start, expected_duration, actual_duration, 
                                        active, callback) {

        var params = [reservation_id, user_id, node_id, expected_start, expected_duration, actual_duration, active];
        var query = 'INSERT OR REPLACE INTO Reservation (reservation_id, '+
                                                        'user_id, '+
                                                        'node_id, '+
                                                        'expected_start, '+
                                                        'expected_duration, '+
                                                        'actual_duration, '+
                                                        'active) '+
                    'VALUES (?, ?, ?, ?, ?, ?, ?);';
        u.getLogger().db(query+' '+params);

        db.query(
            query, 
            params, 
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > modifyOrInsertReservation: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.setReservationActualDuration = function(reservation_id, actual_duration, callback) {
        var params = [actual_duration, reservation_id];
        var query = 'UPDATE Reservation SET actual_duration = ? '
                                       'WHERE reservation_id = ?';
        u.getLogger().db(query+' '+params);

        db.query(
            query,
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > setReservationActualDuration: '+err);

                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.setReservationActive = function(reservation_id, active, callback) {
        var params = [active, reservation_id];
        var query = 'UPDATE Reservation SET active = ? '+
                    ' WHERE reservation_id = ?';
        u.getLogger().db(query+' '+params);

        db.query(
            query,
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > setReservationActive: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.setReservationActualStartTime = function(reservation_id, actual_start, callback) {
        var params = [actual_start, reservation_id];
        var query = 'UPDATE Reservation SET actual_start = ? '+
                    ' WHERE reservation_id = ?';
        u.getLogger().db(query+' '+params);

        db.query(
            query, 
            params,
            function(err, rows) {
                if(err) {
                    u.getLogger().db('error','DB error: model.js > setReservationActualStartTime: '+err);
                    callback(false);
                } else {
                    callback(true);
                }
            }
        );
    };

    super_module.askReservation = function(timestamp, userId, nodeId, callback) {
        var params = [timestamp, userId, nodeId];
        var query = '';
        query = 'SELECT * FROM Reservation WHERE '+
                '(? BETWEEN expected_start AND (expected_start+expected_duration)) AND'+
                ' User_Id = ? AND'+
                ' Node_Id = ?';
        u.getLogger().db(query+' '+params);
        
        db.query(
            query, 
            params,
            schema.ReservationSchema, 
            function(err, rows) {
                if(err) {
                    u.getLogger().error('models.js > askReservation > error: '+err);
                    callback('n'); 
                    return;
                }
                switch(rows.length) {
                    case 0: 
                        console.log('    > NO, response: ', rows);
                        callback('n'); 
                        break;
                    case 1: 
                        console.log('    > YES, response: ', rows);
                        callback('y'); 
                        break;
                    default:
                        callback('n');
                        break;
                }
            }
        );
    };

    super_module.askCurrentReservations = function(timestamp, callback) {
        var params = [timestamp];
        var query = 'SELECT * FROM Reservation WHERE '+
                    '(? BETWEEN expected_start AND (expected_start+expected_duration));';
        u.getLogger().db(query+' '+params);
        
        db.query(
            query, 
            params,
            schema.ReservationSchema, 
            function(err, rows) {
                if(err) {
                    u.getLogger().error('models.js > askReservation > error: '+err);
                    callback([]); 
                    return;
                } else {
                    callback(rows);
                }
            }
        );
    };

}