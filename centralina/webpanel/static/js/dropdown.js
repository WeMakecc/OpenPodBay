
function DropDown(params) {
    this.$placeholder = params.placeholder;
    this.id = params.id;
    this.name = params.name;
    this.url = params.url;
    this.idValueName = params.idValueName;
    this.descriptionValueName = params.descriptionValueName;
    this.callback = params.callback;

    this.inject();
    this.loadFromAjax();
}

DropDown.prototype.inject = function() {
    var skelton = '';
    skelton += '<div class="dropdown" id="'+this.id+'" >';
    skelton += '    <button class="btn btn-default dropdown-toggle" ';
    skelton += '            type="button" ';
    skelton += '            id="'+this.id+'-btn" ';
    skelton += '            data-toggle="dropdown">';
    skelton += '    Select '+this.name;
    skelton += '        <span class="caret"></span>';
    skelton += '    </button>';
    skelton += '    <ul class="dropdown-menu" role="menu" aria-labelledby="dropdown-'+this.id+'-btn">';
    skelton += '    </ul>';
    skelton += '</div>';

    this.$placeholder.append(skelton);
}

DropDown.prototype.loadFromAjax = function() {
    var that = this;
    $.getJSON(this.url, function(items) {
        items.forEach( function(item){
            that.addDropdownItem(item);
        });
    });
}

DropDown.prototype.addDropdownItem = function(item) {
    var that = this;

    var ul = $('#'+that.id+' > ul');
    var li = '<li id="'+item[that.idValueName]+'" role="presentation"><a role="menuitem" tabindex="-1" href="#">'+
             item[that.descriptionValueName]+
             '</a></li>';
    ul.append(li);

    $('#'+that.id+' > ul > #'+item[that.idValueName]).bind('click', function() {
        $('#c-container').html('<div id="calendar"></div>');
        that.callback(item);

        $('#'+that.id+' > button').html(item[that.descriptionValueName] + ' <span class="caret"></span>');
    });
}