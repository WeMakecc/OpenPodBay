#!/bin/bash

# http://www.linuxx.eu/2014/03/automatically-reconnect-wifi-debian.html?m=1

NOW=$(date +"%H:%M %m-%d-%Y")
wlan=`/sbin/ifconfig wlan0 | grep inet\ addr | wc -l`
if [ $wlan -eq 0 ]; then
    service network-manager restart >> /root/wifi.log 2>&1
    echo "$NOW restarting wlan0 via network-manager" >> /root/wifi.log
else
    echo "$NOW WIFI IS UP" >> /root/wifi.log
fi

# add to cron:
#  crontab -e
#  */5 * * * * sh /root/reconnetct_wifi.sh
