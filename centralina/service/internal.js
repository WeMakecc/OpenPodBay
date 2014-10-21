// TODO: this should be a simple two-class module instead.

var rootPath = require('path').dirname(require.main.filename),
    u = require(rootPath+'/utils.js'),
    model = require(rootPath+'/model'),
    config = require(rootPath+'/config'),
    async = require('async');

//----------------------------------------------- Check reservation start
var notified_reservation = {};

function checkAssetReservations() {

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

//----------------------------------------------- Check reservation alarm
var notified_reservationAlarm = {};
var time_alarm = 60;

function checkAssetReservationsAlarm() {

    var now = u.getNow();
    model.askCurrentReservationsAlarm(now, time_alarm, function(reservations) {
        var _reservations = [];
        for(var i=0; i<reservations.length; i++) {
            var r = reservations[i];
            if( notified_reservationAlarm.hasOwnProperty(r.reservation_id) ) {
                // pass
            } else {
                _reservations.push(r);
            }
        } 
        sendReservationsToAssetsAlarm(_reservations);
    });
}

function sendReservationsToAssetsAlarm(reservations) {
    reservations.forEach(function(r) {
        model.getMachine(r.node_id, function(node) {
            sendReservationsToAssetAlarm(r, node);    
        });
        
    });
}

function sendReservationsToAssetAlarm(reservation, node) {
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
                        ' is out in '+time_alarm+' seconds! ');
            var request = require('request');
            var url = 'http://'+node.current_ip+'/arduino/reservedalarm/';
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //console.log('service > internal.js > received:',body);
                }
            }).auth(config.getNodesAuth().username, config.getNodesAuth().password, false);
            doSentOK(node);
        }
    }

    function doSentOK(node) {
        clearTimeout(timeoutId);
        notified_reservationAlarm[reservation.reservation_id] = true;
        setTimeout(function() {
            console.log('service > internal.js > notify '+node.current_ip+
                        ' about the end of the reservation');
            var request = require('request');
            var url = 'http://'+node.current_ip+'/arduino/reservedend/';
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    //console.log('service > internal.js > received:',body);
                }
            }).auth(config.getNodesAuth().username, config.getNodesAuth().password, false);
        }, time_alarm*1000);
    }
}

module.exports.sendReservationsToAssets = sendReservationsToAssets;
module.exports.checkAssetReservations = checkAssetReservations;
module.exports.checkAssetReservationsAlarm = checkAssetReservationsAlarm;

