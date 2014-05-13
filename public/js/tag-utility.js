function fillTagList(userId) {
    var tag_path = DATA_URL+'/tag/'+userId;
    $.getJSON(tag_path, function(tags) {
        tags.forEach(function(tag) {
            var tr = 
                '<tr>'+
                '<th class="id">'+tag.id+'</th>'+
                '<th class="type">'+tag.type+'</th>'+
                '<th class="value">'+tag.value+'</th>'+
                '</tr>';
            $('#tagList > tbody:last').append(tr);
        })
    });
}

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
            console.log(textStatus); 
            location.reload();
        }
    });
}

function getTagInfoFromBridge() {
    var path = DATA_URL+'/tag/read/0';
    $.getJSON(path, function(tag) {
        tag = $.parseJSON($.trim(tag));
        if(tag.type==4) $('#tagType').val("MiFare Classic");
        else if(tag.type==7) $('#tagType').val("MiFare Ultra");
        $('#tagValue').val(tag.value);
    });
}