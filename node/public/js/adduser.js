$(document).ready(function() {
    $('#nav-sidebar-adduser').addClass('active');
    $('#form-add-user-submit').click(function(e) {
        onClickAddUser();
        e.preventDefault();
        return false;
    });
});

function onClickAddUser() {
    var newname = $('#form-add-user-name').val();
    var user_json = {   
        'userName': newname,
        'active': 1
    };
    addUserAjax(user_json);
}

function addUserAjax(user_json) {
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
    $('#alerttt-placeholder').append(
        '<div id="alert-add-user-success" '+
        '     class="alert alert-success" '+
        '     data-alert="alert" style="display:none; "> User '+user_json.userName+' correctly added</div>')
    $('#alert-add-user-success').slideDown().fadeIn();

    setTimeout(function() {
        $("#alert-add-user-success").fadeTo('slow', 0.00, function(){ //fade
             $(this).slideUp('slow', function() { //slide up
                 $(this).remove(); //then remove from the DOM
             });
         });
    }, 3000);
}