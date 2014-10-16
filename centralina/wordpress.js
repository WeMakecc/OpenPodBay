var rootPath = require('path').dirname(require.main.filename),
    config = require(rootPath+'/config');

var crypto = require('crypto');
var key = config.getWordpressAuth().key;
var iv = config.getWordpressAuth().iv;
var cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
var decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
 
function cript(text) {
    cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    var encrypted = cipher.update(text, 'utf8', 'binary');
    encrypted += cipher.final('binary');
    hexVal = new Buffer(encrypted, 'binary');
    newEncrypted = hexVal.toString('hex');
    return newEncrypted;
}

function decript(text) {
    decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    var decrypted = decipher.update(text, 'hex', 'binary');
    decrypted += decipher.final('binary');
    return decrypted;
}

module.exports = {
    cript: cript,
    decript: decript   
}