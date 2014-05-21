$(document).ready(function() {
    $('#nav-sidebar-adduser').addClass('active');
    $('#form-user-submit').click(function(e) {
        e.preventDefault();
        onClickAddUser();
        
    });
    $('#checkbox-user-active').checkbox('check');
    console.log($('checkbox-user-active'));
});

function onClickAddUser() {
    var user_json = getUserDataFromForm();
    $.ajax({
        url: DATA_URL+'/users/add', 
        type: "POST",
        data: user_json,
        success: function(data, textStatus, jqXHR) { 
            console.log("POST resposne:"); 
            console.log(textStatus);
            addUserSucess(user_json);
            //location.reload();
        }
    });
}

function addUserSucess(user_json) {
    resetUserForm();
    setTimeout(function() {
        $('#checkbox-user-active').checkbox('check');
    }, 500);
    
    var id = 'alert-add-user-success'+Math.floor((Math.random() * 100) + 1);

    $('#alerttt-placeholder').append(
        '<div id="'+id+'" '+
        '     class="alert alert-success" '+
        '     data-alert="alert" style="display:none; "> User '+user_json.userName+' correctly added</div>');
    $('#'+id).slideDown().fadeIn();

    setTimeout(function() {
        $('#'+id).fadeTo('slow', 0.00, function(){ //fade
             $(this).slideUp('slow', function() { //slide up
                 $(this).remove(); //then remove from the DOM
             });
         });
    }, 3000);
}