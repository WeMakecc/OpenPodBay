function fillUserAJAX(path) {
    $.getJSON(path, function(users) {
        fillUsers(users);
    });
}

function fillUsers(users) {
    
    function _partial_getUserControl() {
        var s = '<a class="user_control delete" data-toggle="modal" data-target="#confirm-delete">'+
                '<span class="glyphicon glyphicon-trash"></span>'+
                '</a>';
        return s;
    }

    function _partial_fillUserTr(user, controlOption) {
        var s = '<tr class="'+(user.active?'':'inactive')+'">'+ 
                '<th class="id">'+user.user_id+'</th>'+
                '<th class="name">'+
                '    <a class="user_control modify">'+user.username+'</a>'+
                '</th>'+
                '<th>'+controlOption+'</th>'+
                '</tr>';
        return s;
    }

    $('#userList > tbody').empty();
    
    users.forEach(function(user){
        var c = _partial_getUserControl()
          , tr = _partial_fillUserTr(user, c);
        $('#userList > tbody:last').append(tr);
    });
    addControlToUsersTable();
}

function addControlToUsersTable() {

    $('.user_control.delete').css('cursor', 'pointer');

    // click on modify redirect on the single user page
    // i.e. http://localhost:3000/view/users/1
    $('.user_control.modify').attr('href', function() {
        var userTr = this.parentNode.parentNode
          , userName = userTr.getElementsByClassName('name')[0].innerHTML
          , userId = userTr.getElementsByClassName('id')[0].innerHTML;
        return VIEW_URL+'/users/'+userId;
    });

    // click on delete open the twitter bootstrap modal
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
                e.preventDefault();
            });

        });
    });
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- delete user

function deleteUserAjax(userId, userName) {
    $.ajax({
        type: 'DELETE',
        url: DATA_URL+'/users/' + userId,
        success: deleteUserSuccess(userId, userName),
    }).done(function( response ) {
        if (response.msg === '') {
        }
    });
}

function deleteUserSuccess(userId, userName) {
    var id = 'alert-delete-user-success'+Math.floor((Math.random() * 100) + 1);

    $('#alerttt-placeholder').append(
        '<div id="'+id+'" '+
        '     class="alert alert-success" '+
        '     data-alert="alert" style="display:none;"> User #'+userId+' '+userName+' correctly deleted</div>');
    $('#'+id).slideDown().fadeIn();

    // deve essere dentro un timer altrimenti non è aggiornato perchè l'animazione non è finita
    setTimeout(function() {
        jQuery.ready();
    }, 500);

    setTimeout(function() {
        $('#'+id).fadeTo('slow', 0.00, function(){ //fade
             $(this).slideUp('slow', function() { //slide up
                 $(this).remove(); //then remove from the DOM
             });
         });
    }, 3000);
}
