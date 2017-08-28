#!/bin/bash
echo -e "INSTALL\t: upgrading Raspbian operating system"
sudo apt update
sudo apt full-upgrade

echo -e "INSTALL\t: installing webcam motion capture"
sudo apt install motion
sudo mkdir -p /var/log/motion
sudo chown pi:pi /var/log/motion

echo -e "INSTALL\t: installing Node V8"
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

