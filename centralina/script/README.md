*Open the pod bay doors, please, HAL. Open the pod bay doors, please, HAL.*
# Open pod bay door

## Production script

**Production enviroments are hard to configure**.

In this directory there are some handy scripts for production enviroment under linux. Not the best ones but works for our server.

- `centralina.init.d`: a service under debian machine that runs [forever](https://github.com/nodejitsu/forever): if the centralina crashes it is restarted.
- `ubuntu_reconnect_wifi.sh`: we have used for testing an ubuntu machine and we noticed that ubuntu machines does not recconect automatically if the router goes down. This script is a workaround.