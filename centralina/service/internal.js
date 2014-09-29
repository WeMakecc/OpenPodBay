var rootPath = require('path').dirname(require.main.filename),
    u = require(rootPath+'/utils.js'),
    model = require(rootPath+'/model'),
    config = require(rootPath+'/config'),
    async = require('async');


var notified_reservation = {};

function sendReservationsToAssets(reservations) {
    reservations.forEach(function(r) {
        model.getMachine(r.node_id, function(node) {
            sendReservationsToAsset(r, node);    
        });
        
    });
}

function sendReservationsToAsset(reservation, node) {
    var timeoutId = setInterval(doSend, 1000);

    function doSend() {
        if(node.length == 0) {
            u.getLogger('ERROR > Service at index.js::sendReservationsToAssets() '+
                        'should notify an asset that does not exist \n'+
                        'Reservation: '+reservation);
        } else if(node.length > 1) {
            u.getLogger('ERROR > Service at index.js::sendReservationsToAssets() '+
                        'should notify an asset with multiple id \n'+
                        'Reservation: '+r+'\n'+
                        'Node: '+node);
        } else if(node.length == 1) {
            node = node[0];
            var d = reservation.expected_start + reservation.expected_duration - u.getNow();
            console.log('I has to notify the node '+node.node_id+' with ip '+node.current_ip + 
                        ' about the reservation '+reservation.reservation_id+
                        ' of '+d+' seconds');
            var request = require('request');
            var url = 'http://'+node.current_ip+'/arduino/reserved/'+d;
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log('service > internal.js > received:',body);
                }
            }).auth(config.getNodesAuth().username, config.getNodesAuth().password, false);
            doSentOK();
        }
    }

    function doSentOK () {
        clearTimeout(timeoutId);
        notified_reservation[reservation.reservation_id] = true;
    }
}

function checkAssetReservations() {
    console.log('checkAssetReservations > ----------------------------------------');

    // async.parallel([
    //     function(callback){
    //         model.askCurrentReservations(u.getNow(), function(currentReservations) {
    //             callback(null, currentReservations);
    //         });
    //     },
    //     function(callback){
    //         model.getMachines(function(_res) {
    //             assets = _res.filter(function(machine) {
    //                 return machine.type=='asset';
    //             });
    //             callback(null, assets);
    //         });
    //     }
    // ], function(err, results) {
    //     console.log(results);
    //     var current_reservations = results[0];
    //     var assets = results[1];

    //     var _reservations = []; // reservation to be send

    //     for(var i=0; i<reservations.length; i++) {
    //         var r = reservations[i];
    //         if( notified_reservation.hasOwnProperty(r.reservation_id) ) {
    //             // pass
    //         } else {  
    //             _reservations.push(r);
    //         }
    //     } 

    // });

    var now = u.getNow();
    model.askCurrentReservations(now, function(reservations) {
        var _reservations = [];
        for(var i=0; i<reservations.length; i++) {
            var r = reservations[i];
            if( notified_reservation.hasOwnProperty(r.reservation_id) ) {
                // pass
            } else {
                _reservations.push(r);
            }
        } 
        sendReservationsToAssets(_reservations);
    });
}

module.exports.sendReservationsToAssets = sendReservationsToAssets;
module.exports.checkAssetReservations = checkAssetReservations;