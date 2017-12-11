#!/bin/bash

sudo apt-get update
echo -e "INSTALL\t: `date` setting up Raspberry Pi"

if [ ! -e node_modules ]; then
    echo -e "INSTALL\t: installing nodejs"
    curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -o
    sudo apt install -y nodejs
    npm install
	npm run build
fi

if [ ! -e /etc/rc2.d/S50oyapi ]; then
	echo -e "INSTALL\t: configuring oyapi for autoload on boot"
	sudo cp scripts/oyapi /etc/init.d/oyapi
	sudo ln -s /etc/init.d/oyapi /etc/rc2.d/S50oyapi
fi

exit
scripts/opencv-install.sh

echo -e "INSTALL\t: installing webcam motion capture"
sudo apt install motion
sudo mkdir -p /var/log/motion
sudo chown pi:pi /var/log/motion

echo -e "INSTALL\t: installing Node V8"
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

scripts/sqlite3-install.sh

echo -e "INSTALL\t: `date` OyaMist Raspberry Pi setup completed"
