var u = require('./utils.js');

u.getLogger();

var webpanel = require('./webpanel')(),
    portWebpanel = process.env.PORT || 5000;

var server = webpanel.listen(portWebpanel, function() {
    console.log('Listening on port %d', server.address().port);
    //console.log( u.listAllAPI(webpanel).toString() );
});

u.sendMail({
    subject: "[Pot bay door] start",
    text: u.getNowPrettyPrint() + " restart server"
});