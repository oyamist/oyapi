#!/bin/bash

echo -e "INSTALL\t: `date` Raspberry Pi WIFI Access Point (BEGIN)"


echo -e "INSTALL\t: installing WIFI access point"
sudo apt-get -y install dnsmasq hostapd
sudo systemctl stop dnsmasq
sudo systemctl stop hostapd

STATICIP=192.168.4.1
grep -e "${STATICIP}" /etc/dhpcd.conf
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INSTALL\t: DHCP already configured for ${STATICIP}"
else
    echo -e "INSTALL\t: configuring DHCP for ${STATICIP}..."
    sudo echo -e "interface wlan0" >> /etc/dhpcd.conf
    sudo echo -e "    static ip_address=${STATICIP}/24" >> /etc/dhpcd.conf
fi

echo -e "INSTALL\t: `date` Raspberry Pi WIFI Access Point (END)"
