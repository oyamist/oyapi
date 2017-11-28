#!/bin/bash

echo -e "START\t: $0 `date`"
pushd `dirname $0` >& /dev/null

CQLVER=`cqlsh --version`
RC=$?
if [ "$RC" == "0" ]; then
    echo -e "INSTALL\t: Cassandra ($CQLVER) is already installed => OK"
else
    echo -e "INSTALL\t: Installing Cassandra"
    echo "deb http://www.apache.org/dist/cassandra/debian 36x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
    curl https://www.apache.org/dist/cassandra/KEYS | sudo apt-key add -
    sudo apt-get update
    sudo apt-get install cassandra
    RC=$?; if [ "$RC" != "0" ]; then 
        echo -e "INSTALL\t: Cassandra installation failed RC:$RC"
        exit $RC;
    fi
    echo -e "INSTALL\t: Cassandra (`cqlsh --version`) installed => OK"
fi

echo -e "INSTALL\t: creating oyamist keyspace and tables"
cqlsh -f create.cql

echo -e "END\t: $0 `date`"
