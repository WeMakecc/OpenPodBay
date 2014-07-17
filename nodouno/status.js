var fs = require('fs'),
    local = JSON.parse(fs.readFileSync('./config/local.auth'));

var Status = {}; 

Status.id = local.nodeId;
Status.status = '1';

module.exports = Status;