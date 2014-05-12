function fillUsers() {
    console.log('fill users');
    var users_path = DATA_URL+'/users';
    $.getJSON(users_path, function(users) {
        users.forEach(function(user){
            var controlOption = 
                '<a class="user_control delete" data-toggle="modal" data-target="#confirm-delete" >delete</a>'+
                '/'+
                '<a class="user_control modify" data-toggle="modal" >modify</a>';
            var tr = '<tr>'+ 
                '<th class="id">'+user.id+'</th>'+
                '<th class="name">'+user.name+'</th>'+
                '<th>'+controlOption+'</th>'+
                '</tr>';
            $('#userList > tbody:last').append(tr);
        });
    addControl();
    });
}

function addControl() {
    $('.user_control.modify').attr('href', function() {
        var userTr = this.parentNode.parentNode,
        userName = userTr.getElementsByClassName('name')[0].innerHTML,
        userId = userTr.getElementsByClassName('id')[0].innerHTML;
        return VIEW_URL+'/users/'+userId;
    });

    $('.user_control.delete').css('cursor', 'pointer');
    $('.user_control.delete').click(function() {
        var userTr = this.parentNode.parentNode,
        userName = userTr.getElementsByClassName('name')[0].innerHTML,
        userId = userTr.getElementsByClassName('id')[0].innerHTML;
        $('#confirm-delete').on('show.bs.modal', function(e) {
            $( '.user-to-delete')
            .html('Delete user: #<strong>' + 
            userId + ' ' + 
            userName +
            '</strong>');
        });
        var btnDelete = $('#confirm-delete').find('.btn.danger');
        btnDelete.unbind("click");
        btnDelete.click(function(e) {
            $('#confirm-delete').modal('hide');
            deleteUser(userId, userName);
        });
    });
}

function deleteUser(userId, userName) {
    $.ajax({
        type: 'DELETE',
        url: DATA_URL+'users/' + userId,
        success: function(data, status) {
            deleteUserSuccess(userId, userName);
        }
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
    setTimeout(function() {
        $("#alert-delete-user-success").fadeOut('slow',function() {
            $(this).remove();
            location.reload();
        })
    }, 3000);
}

function fillUser(id) {
    var users_path = DATA_URL+'/users/'+id;
    $.getJSON(users_path, function(users) {
        users.forEach(function(user){
            $('#page-header-title').append(user.name);
            var controlOption = 
                '<a class="user_control delete" '+
                '   data-toggle="modal"'+
                '   data-target="#confirm-delete">delete</a>'+
                '/'+
                '<a class="user_control" data-toggle="modal" href="#users">modify</a>';
            var tr = 
                '<tr>'+ 
                '    <th class="id">'+user.id+'</th>'+
                '    <th class="name">'+user.name+'</th>'+
                '    <th>'+controlOption+'</th>'+
                '</tr>';
            $('#userList > tbody:last').append(tr);
        });

        addControl();
    });
}