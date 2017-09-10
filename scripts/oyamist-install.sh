#!/bin/bash
echo -e "INSTALL\t: `date` setting up Raspberry Pi`

scripts/opencv-install.sh

echo -e "INSTALL\t: installing webcam motion capture"
sudo apt install motion
sudo mkdir -p /var/log/motion
sudo chown pi:pi /var/log/motion

echo -e "INSTALL\t: installing Node V8"
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

echo -e "INSTALL\t: `date` OyaMist Raspberry Pi setup copmleted"
