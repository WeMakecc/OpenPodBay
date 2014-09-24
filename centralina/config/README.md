*Open the pod bay doors, please, HAL. Open the pod bay doors, please, HAL.*
# Open pod bay door

## Configuration files
In this directory there are some configuration file. They are in JSON format and are ignored from the repository in the `.gitignore` main file. But there are some example. **All the config file MUST be present**

- `local.auth`: the password for the webpanel admin and for the arduinos (all the service part is protected by basic auth authentication).
- `mail.auth`: the gmail account to notification when the server start (if something goes wrong and the server crashes and the linux service restarts the centralina)
- `nodes.auth`: the password that protects the arduinos (all the API in the arduino side has to be protected by a basic auth password. This configuration is acheived by the [Arduino YUN configuration page](http://arduino.cc/en/Guide/ArduinoYun#toc5))