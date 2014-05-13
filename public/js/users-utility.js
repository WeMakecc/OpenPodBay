//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- user list

var __k = 0;

function fillUsers() {
    console.log("fillUsers");
    $('#userList > tbody').empty();

    var users_path = DATA_URL+'/users';
    $.getJSON(users_path, function(users) {
        console.log(users);
        users.forEach(function(user){
            var controlOption = 
                '<a class="user_control delete" data-toggle="modal" data-target="#confirm-delete" >delete</a>'+
                '/'+
                '<a class="user_control modify" data-toggle="modal" >modify</a>';
            var tr = '<tr class="'+(user.active?'':'inactive')+'">'+ 
                '<th class="id">'+user.id+'</th>'+
                '<th class="name">'+user.name+'</th>'+
                '<th>'+controlOption+'</th>'+
                '</tr>';
            $('#userList > tbody:last').append(tr);
        });
        addControlToUsersTable();
    });
}

function addControlToUsersTable() {

    $('.user_control.delete').css('cursor', 'pointer');

    // click on modify
    $('.user_control.modify').attr('href', function() {
        var userTr = this.parentNode.parentNode
          , userName = userTr.getElementsByClassName('name')[0].innerHTML
          , userId = userTr.getElementsByClassName('id')[0].innerHTML;
        return VIEW_URL+'/users/'+userId;
    });

    // click on delete
    $('.user_control.delete').click(function() {
        var userTr = this.parentNode.parentNode
          , userName = userTr.getElementsByClassName('name')[0].innerHTML
          , userId = userTr.getElementsByClassName('id')[0].innerHTML;

        $('#confirm-delete').on('show.bs.modal', function(e) {
            $('.user-to-delete').html(
                'Delete user: #<strong>' + 
                userId + ' ' + 
                userName +
                '</strong>'
            );
    
            var btnDelete = $('#confirm-delete').find('.btn.danger');
            btnDelete.unbind("click");
            btnDelete.click(function(e) {
                $('#confirm-delete').modal('hide');
                deleteUserAjax(userId, userName);
                return false;
            });

        });
    });
}

function deleteUserAjax(userId, userName) {
    $.ajax({
        type: 'DELETE',
        url: DATA_URL+'/users/' + userId,
        success: deleteUserSuccess(userId, userName)
    }).done(function( response ) {
        if (response.msg === '') {
            console.log('user deted');
        } else {
        }
        // update - recall populateTable
    });
}

function deleteUserSuccess(userId, userName) {
    console.log('User #'+userId+' '+userName+' correctly deleted');

    $('#alerttt-placeholder').append(
        '<div id="alert-delete-user-success" '+
        '     class="alert alert-success" '+
        '     data-alert="alert"> User #'+userId+' '+userName+' correctly deleted</div>');

    // perchè???
    setTimeout(function() {
        fillUsers();
    }, 500);

    setTimeout(function() {
        $("#alert-delete-user-success").fadeOut('slow',function() {
            $(this).remove();
        })
    }, 3000);
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- modify

function fillUser(id) {
    var users_path = DATA_URL+'/users/'+id;
    $.getJSON(users_path, function(users) {
        users.forEach(function(user){
            $('#page-header-title').append(user.name);
            $('#form-edit-user-name').val(user.name);
            if(user.active) {
                $('#checkboxActive').checkbox('check');    
            }
            
        });
    });
}

function onClickModifyUser(userId) {
    var newname = $('#form-edit-user-name').val()
      , active = $('#checkboxActive').is(':checked');
    var user_json = {
        'userId': userId,
        'userName': newname,
        'active': (active?1:0)
    };
    try {
        modifyUserAjax(user_json);
    } catch(e) {
        console.log(e);
    } 
    return false;
}


function modifyUserAjax(user_json) {
    $.ajax({
        url: DATA_URL+'/users/'+user_json.userId, 
        type: "PUT",
        data: user_json,
        success: function(data, textStatus, jqXHR) { 
            console.log("PUT resposne:"); 
            console.log(textStatus); 
            location.reload();
        }
    });
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- add user


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
            //location.reload();
        }
    });
}