# INSTALL

## Centralina

### Install the webserver
The centralina is a node.js web server (more information [here](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager) to install node.js on debian). Clone the repository and inside the directory `centralina` type

```bash
$ npm install
```

This process should end without errors (see `package.json` for a detailed description of all the dependecies).

Now type `node server.js` to launch the webserver.

But before that you need to make some configurations...

### Configure the webserver

**Important Note:** ALL these steps are mandatory.

First of all, [install](http://stackoverflow.com/questions/11455164/how-to-install-sqlite-on-debian) the database engine [sqlite3](http://www.sqlite.org). It is tested with SQLite version 3.7.12.

Inside the directory `~PODABY_PATH/centralina/model/db` type:

```bash
$ sqlite3 database.db
sqlite> .read db.sql;
sqlite> .exit
```

Then be sure that all the configuration file are crrectly modified. They has to be inside `~PODABY_PATH/config`:
```
local.auth
mail.auth
nodes.auth
wordpress.auth
```
See the readme inside `~PODABY_PATH/config` to complete explanation.

Finally create the log files (with the right permission to the files depends on which user will execute it):
```
$ cd ~PODABY_PATH/centralina
$ mkdir log
$ touch db.log
$ touch error.log
$ touch info.log
$ touch network.log
$ touch view.log
```

### Install the webserver as a linux service
There an script for managing the node.js webserver as a linux service. It should works under all debian-like linux distribution. The script is: `centralina.init.d`. It is based on [upstart](http://upstart.ubuntu.com).

It keeps the webserver running also when it crashes. It is based on [forever](https://github.com/nodejitsu/forever) so you need to install it first:
```bash
$ [sudo] npm install forever -g
```
See [this blog post](https://www.exratione.com/2013/02/nodejs-and-forever-as-a-service-simple-upstart-and-init-scripts-for-ubuntu/
) for information and credits.

You need to set the correct path into the script to make it works. Edit the script and edit the following lines:

```bash
env NODE_BIN_DIR=""
env NODE_PATH=""
env APPLICATION_PATH=""
env DB_PATH=""
env PIDFILE=""
env LOG=""
```

Copy this file both as `/etc/init.d/centralina2` and `/etc/init/centralina2.conf` with the right permission: `chmod a+x /etc/init.d/centralina2`. A soft link should works too. 

To start the webserver type:
`service centralina2 start`

You could check the log specified in the service script (`env LOG`) file in real-time with:

```bash
tail -f log_file.log
```

# Arduino YUN

There are two kind of Arduino YUN that can be set: Gateway or Asset. The firmware is different, and you can find it in `~PODABY_PATH/Gateway2` and `~PODABY_PATH/Asset2`. They has to be compiled and uploaded into the arduinos with a [YUN-compatible IDE](http://arduino.cc/en/Guide/ArduinoYun).

The OpenWRT update is not required but there could be some nice-to-have feature on the next release, so check it! See [Arduino Yun Sys-upgrade tutorial](http://arduino.cc/en/Tutorial/YunSysupgrade) for detailed informations.

Once done that you need to copy the python script `callserver.py` and the configuration file `local.auth` to the root directory of the openwrt inside the yun. An easy way to find the ip address of the yun is to open the IDE: the ip of the active yun in the network should be seen in *Tools > Port* menu. Then, you can use `scp` linux command to copy the file: 

```bash
$ scp ~PODABY_PATH/Gateway2/script/* root@192.168.1.110:~
```

Finally, ssh into the yun and edit the `local.auth` file with the correct parameters.