#!/bin/bash

NODEVER=`node --version | sed -e 's/\..*//'`
echo nodever is $NODEVER
if [ "$NODEVER" = "v10" ]; then
    echo node version $NODEVER OK
else
    echo node version $NODEVER update required
    sudo npm cache clean -f
    sudo npm install -g n
    sudo chmod g+ws /usr/local
    n latest
fi
