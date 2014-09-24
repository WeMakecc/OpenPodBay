
*Open the pod bay doors, please, HAL. Open the pod bay doors, please, HAL.*
# Open pod bay door

## Centralina

Here is the webserver. It is written in node.js with express.js as framework and EJS as template engine. As a database we chose sqlite3 with dblite as driver. See `package.json` for dependencies.

It has three main components:
- a service, that handles http gets from the nfc reader modules (from the arduino yun) on port 5001
- a webpanel, that handles the REST API and the views for the webpanel on port 5000
- the model (internal used from the service and the webpanel)

The directories are structed as follow:
- `config`: configuration files accessible from anyway in the centralina server (see the readme in it)
- `keys`: private and public keys used for the https thing. They are mainly meant for webpanel usage
- `log`: the directory where the logs are saved. Check the permisisons in production enviroment
- `model`: the js files that are talking to the db. The sqlite3 single file database must be placed in `model/db/database.db`
- `script`: some usefull scripts for the production linux enviroment. See the internal readme
- `service`: the REST API on top of express.js frameworks for the service previously described
- `webpanel`: the REST API and the EJS view for the web panel. The .ejs files are in `webpanel/views` while the static contens (css, javascript, front-end third-pard libs) are in `webpanel/views/static`

 