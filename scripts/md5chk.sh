#!/bin/bash

A=$1
B=$2
echo -e "MD5\t: verifying $A $B ..."
if [ ! -e $A ]; then
    echo -e "ERROR\t: $A not found"
    exit -1
fi
if [ ! -e $B ]; then
    echo -e "ERROR\t: $B not found"
    exit -1
fi

ASIZE=`wc -c $A | awk '{print $1}'`
A4=$(($ASIZE/4))

function md5check() {
    ARGS="status=none iflag=count_bytes,skip_bytes conv=sync skip=$1 count=$2 bs=1M"
    #echo -e "\t: dd if=$A $ARGS | md5sum -b"
    MD5A=`dd if=$A $ARGS | md5sum -b`
    #echo -e "\t: dd if=$B $ARGS | md5sum -b"
    MD5B=`dd if=$B $ARGS | md5sum -b`
    if [ "$MD5A" == "$MD5B" ]; then
        echo -e "MD5\t: $MD5A $MD5B OK $((($1+$2)*100/ASIZE))%"
    else
        echo -e "MD5\t: $MD5A $MD5B FAIL"
        echo -e "ERROR\t: md5sum mismatch after $1"
        exit -1
    fi
} #md5check

function checksum() {
    echo -e "MD5\t: checking ${ASIZE}B in chunks of ${A4}B"
    md5check $((0*A4)) $A4
    md5check $((1*A4)) $A4 1M
    md5check $((2*A4)) $A4 1M
    md5check $((ASIZE-A4)) $A4 1M
    echo -e "MD5\t: " `date` " PASSED"
} #checksum

checksum 2>&1 

exit 0
