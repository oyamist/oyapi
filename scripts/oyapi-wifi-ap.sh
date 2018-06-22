#!/bin/bash

echo -e "INSTALL\t: `date` Raspberry Pi WIFI Access Point (BEGIN)"


echo -e "INSTALL\t: installing WIFI access point"
sudo apt-get -y install dnsmasq hostapd
sudo systemctl stop dnsmasq
sudo systemctl stop hostapd

STATICIP=192.168.4.1
grep -e "${STATICIP}" /etc/dhcpcd.conf
RC=$?; if [ "$RC" == "0" ]; then
    echo -e "INSTALL\t: dhcpcd.conf already configured for ${STATICIP}"
else
    echo -e "INSTALL\t: configuring dhcpcd.conf for ${STATICIP}..."
    sudo echo -e "interface wlan0" >> /etc/dhcpcd.conf
    sudo echo -e "    static ip_address=${STATICIP}/24" >> /etc/dhcpcd.conf
fi

if [ -e /etc/dnsmasq.conf.orig ]; then
    echo -e "INSTALL\t: discarding current dnsmasq.conf"
else
    echo -e "INSTALL\t: saving current dnsmasq.conf"
    sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig
fi
sudo echo -e "interface=wlan0" > /etc/dnsmasq.conf
sudo echo -e "dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h" >> /etc/dnsmasq.conf

echo -e "INSTALL\t: Starting dhcpcd service"
sudo service dhcpcd restart

echo -e "INSTALL\t: Setting up hostapd.conf for WiFi access point"
HOSTAPD=/etc/hostapd/hostapd.conf
sudo rm -f $HOSTAPD
sudo echo -e "interface=wlan0" >> $HOSTAPD
sudo echo -e "driver=nl80211" >> $HOSTAPD
sudo echo -e "ssid=OyaMist" >> $HOSTAPD
sudo echo -e "hw_mode=g" >> $HOSTAPD
sudo echo -e "channel=7" >> $HOSTAPD
sudo echo -e "wmm_enabled=0" >> $HOSTAPD
sudo echo -e "macaddr_acl=0" >> $HOSTAPD
sudo echo -e "auth_algs=1" >> $HOSTAPD
sudo echo -e "ignore_broadcast_ssid=0" >> $HOSTAPD
sudo echo -e "wpa=2" >> $HOSTAPD
sudo echo -e "wpa_passphrase=Aeroponics" >> $HOSTAPD
sudo echo -e "wpa_key_mgmt=WPA-PSK" >> $HOSTAPD
sudo echo -e "wpa_pairwise=TKIP" >> $HOSTAPD
sudo echo -e "rsn_pairwise=CCMP" >> $HOSTAPD

sudo sed -i 'sx^#DAEMON_CONF.*xDAEMON_CONF="/etc/hostapd/hostapd.conf"x' /etc/default/hostapd

echo -e "INSTALL\t: Starting hostapd WiFi access point  service"
sudo systemctl start hostapd
RC=$?; echo -e "INSTALL\t: => RC:$RC"
echo -e "INSTALL\t: Starting dnsmasq DNS  service"
sudo systemctl start dnsmasq
RC=$?; echo -e "INSTALL\t: => RC:$RC"

echo -e "INSTALL\t: `date` Raspberry Pi WIFI Access Point (END)"
