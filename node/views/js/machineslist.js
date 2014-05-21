//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- init

$(document).ready(function() {
    fillMachines();
    $('#nav-sidebar-machineslist').addClass('active');
});

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- dom manipulation

function fillMachines() {
    console.log('fill machines from ajax');
    var machines_path = DATA_URL+'/machines';
    $.getJSON(machines_path, function(machines) { 
        console.log(machines);
        machines.forEach(function(machine){
            var tr = '<tr>'+ 
                '<th class="id">'+machine.nodeId+'</th>'+
                '<th class="ip">'+machine.ip+'</th>'+
                '<th class="status"> OK </th>'+
                '</tr>';
            $('#machinesList > tbody:last').append(tr);
        });
    });
}

function resetMachinesList() {

}