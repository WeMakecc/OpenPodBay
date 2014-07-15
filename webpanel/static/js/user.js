//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- init

$(document).ready(function() {

    resetUserPage();

    fillUser(userId);
    fillTagList(userId);

    // set active page in the nav
    $('#nav-sidebar-singleuser').addClass('active');
    
    // bind clicks on buttons
    $('#form-user-submit').click(function(e) {
        onClickModifyUser(userId);
        e.preventDefault();
    });
    $('#form-add-tag-submit').click(function(e) {
        onClickAddTag(userId);
        return false;
    });
    $('#tagOnReader').click(function(e) {
        getTagInfoFromBridge();
        return false;
    })

    // // drop down menu hacks
    // $('#dropdownmenu').width( $('#dropdownbutton').width() );

    // $.ajax({
    //     url: DATA_URL+'/machines/', 
    //     type: "GET",
    //     success: function(data, textStatus, jqXHR) { 
    //         for(d in data) {
    //             $('#dropdownmenu').append(
    //               '<li rel="'+d+'">'+
    //               '    <a tabindex="-1" class="opt active">'+
    //               '        <span class="pull-left">'+d+'</span>'+
    //               '    </a>'+
    //               '</li>')
    //         }
            
    //         $('#dropdownmenu > li').click(function(e) {
    //             $('#dropdownbuttonlabel').html(
    //                 $(this).children().children().html()
    //             );
    //         });
    //     }
    // });
});

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- dom manipulation

function resetUser() {
    $('#page-header-title').html('User ');
    resetUserForm();
}

function resetTags() {
    $('#tagList > tbody').empty();
    $('#tagType').val('');
    $('#tagValue').val('');
}

function resetUserPage() {
    resetUser();
    resetTags();
}

function fillUser(id) {
    var users_path = DATA_URL+'/users/'+id;
    $.getJSON(users_path, function(users) {
        if(users && users.length==0) {
            $('#user_container').empty();
            $('#alerttt-placeholder').append(
                '<div id="alert-user_not_found" '+
                '     class="alert alert-danger" '+
                '     data-alert="alert"> User #'+id+' not found</div>');
            return;
        }
        users.forEach(function(user){
            $('#page-header-title').append(user.username);
            fillUserForm(user);
        });
    });
}

function fillTagList(userId) {
    var tag_path = DATA_URL+'/tag-by-user/'+userId;
    $.getJSON(tag_path, function(tags) {
        tags.forEach(function(tag) {
            var tr = 
                '<tr>'+
                '<th class="id">'+tag.tag_id+'</th>'+
                '<th class="type">'+tag.type+'</th>'+
                '<th class="value">'+tag.value+'</th>'+
                '</tr>';
            $('#tagList > tbody:last').append(tr);
        })
    });
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- modify

function onClickModifyUser(userId) {
    var user_json = getUserDataFromForm();
    user_json['userId'] = userId;
    $.ajax({
        url: DATA_URL+'/users/'+user_json.userId, 
        type: "PUT",
        data: user_json,
        success: function(data, textStatus, jqXHR) { 
            console.log("PUT resposne:"); 
            console.log(textStatus); 
            modifyUserSucess(user_json);
        }
    });
}

function modifyUserSucess(user_json) {
    resetUser();
    fillUser(userId);

    $('#alerttt-placeholder').append(
        '<div id="alert-add-user-success" '+
        '     class="alert alert-success" '+
        '     data-alert="alert" style="display:none; "> User '+user_json.userName+' correctly modified</div>')
    $('#alert-add-user-success').slideDown().fadeIn(function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });

    setTimeout(function() {
        $("#alert-add-user-success").fadeTo('slow', 0.00, function(){ //fade
             $(this).slideUp('slow', function() { //slide up
                 $(this).remove(); //then remove from the DOM
             });
         });
    }, 3000);
}

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//---------------------------------------------------------------------------- mtag

function onClickAddTag(userId) {
    var tagType = $('#tagType').val()
      , tagValue = $('#tagValue').val();

    var tag_json = {
        'userId': userId,
        'type': tagType,
        'value': tagValue
    };
    addTagAjax(tag_json);
    return false;
}

function addTagAjax(tag_json) {
    $.ajax({
        url: DATA_URL+'/tag/add', 
        type: "POST",
        data: tag_json,
        success: function(data, textStatus, jqXHR) { 
            console.log("POST resposne:"); 
            addTagSuccess(tag_json);
        }
    });
}

function addTagSuccess(tag_json) {
    resetTags();
    fillTagList(userId);

    $('#alerttt-placeholder').append(
        '<div id="alert-add-user-success" '+
        '     class="alert alert-success" '+
        '     data-alert="alert" style="display:none; "> Tag '+tag_json.value+' correctly added</div>')
    $('#alert-add-user-success').slideDown().fadeIn(function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });

    setTimeout(function() {
        $("#alert-add-user-success").fadeTo('slow', 0.00, function(){ //fade
             $(this).slideUp('slow', function() { //slide up
                 $(this).remove(); //then remove from the DOM
             });
         });
    }, 3000);
}

function getTagInfoFromBridge() {
    var path = DATA_URL+'/tag/read/'+$('#dropdownbuttonlabel').html();
    console.log('user.js > getTagInfoFromBridge > path: '+path);
    $.getJSON(path, function(tag) {
        console.log(tag);
        if(tag.type==4) $('#tagType').val("MiFare Classic");
        else if(tag.type==7) $('#tagType').val("MiFare Ultra");
        else if(tag.type==0) $('#tagType').val('');
        $('#tagValue').val(tag.value);
    });
}