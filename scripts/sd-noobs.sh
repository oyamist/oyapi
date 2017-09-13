#!/bin/bash
echo -e "START\t: $0 version 0.1.0" `date`

if [ "$(id -u)" != "0" ]; then
    echo -e "ERROR\t: This script must be run as root" 1>&2
    exit 1
fi

sync

#SD=$1
#if [ "$SD" == "" ]; then
#    echo -e "ERROR\t: specify path to unmounted SD card device (e.g., /dev/sdc)"
#    exit -1
#fi

function sdunmount() {
    umount $1
    RC=$?
    if [ "$RC" == "0" ]; then
        echo -e "SDCARD\t: $1 unmounted"
    else
        echo -e "SDCARD\t: umount $1 => $RC"
    fi
} #sdunmount

function copyfile() {
    CMD="cp $1 $2"
    echo -e "SDCARD\t: $CMD"
    $CMD
    RC=$?
    if [ "$RC" != "0" ]; then
        echo -e "ERROR\t: could not copy $1 to $2"
        exit -1
    fi
    echo -e "SDCARD\t: syncing... (DO NOT REMOVE CARD)"
    sync
    ./md5chk.sh $1 $2
    RC=$?
    if [ "$RC" != "0" ]; then
        echo -e "ERROR\t: $2 copy is invalid"
        exit -1
    fi
}

function format() {
    while true; do
        read -p "SDCARD  : Eject and remove all SD cards. Enter "y" when ready:" yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) exit;;
                * ) echo "        : Please answer yes or no.";;
        esac
    done
    sleep 1
    ls /dev > /tmp/dev1

    while true; do
        read -p "SDCARD  : Insert blank SD card. Enter "y" when ready:" yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) exit;;
                * ) echo "        : Please answer yes or no.";;
        esac
    done
    sleep 3
    ls /dev > /tmp/dev2

    SD=`diff /tmp/dev1 /tmp/dev2 | grep '>' | sed -n 1p | sed sx..x/dev/x`
    SD1=`diff /tmp/dev1 /tmp/dev2 | grep '>' | sed -n 2p | sed sx..x/dev/x`
    SD2=`diff /tmp/dev1 /tmp/dev2 | grep '>' | sed -n 3p | sed sx..x/dev/x`
    SD3=`diff /tmp/dev1 /tmp/dev2 | grep '>' | sed -n 4p | sed sx..x/dev/x`
    SD4=`diff /tmp/dev1 /tmp/dev2 | grep '>' | sed -n 5p | sed sx..x/dev/x`
    SD5=`diff /tmp/dev1 /tmp/dev2 | grep '>' | sed -n 6p | sed sx..x/dev/x`
    if [ "$SD" == "" ]; then
        echo -e "ERROR\t: No SD card detected"
        exit 1
    fi
    
    if [ "unmount" == "true" ]; then
        if [ "$SD1" == "" ]; then
            echo -e "SDCARD\t: SD card has no mounted partitions"
        else 
            echo -e "SDCARD\t: unmounting partitions..."
            SDMOUNT=`df -h --output=target $SD1 | sed -n 2p | sed 'sx/[^/]*$xx'`
            if [ "$SD1" != "" ]; then sdunmount $SD1; fi
            if [ "$SD2" != "" ]; then sdunmount $SD2; fi
            if [ "$SD3" != "" ]; then sdunmount $SD3; fi
            if [ "$SD4" != "" ]; then sdunmount $SD4; fi
            if [ "$SD5" != "" ]; then sdunmount $SD5; fi
            if [ "$SDMOUNT" == "" ]; then SDMOUNT="/mnt"; fi
        fi
    fi

    parted $SD print

    while true; do
        read -p "SDCARD  : Format SD card? [y/n]:" yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) exit;;
                * ) echo "        : Please answer yes or no.";;
        esac
    done
        
    if [ "$SD1" != "" ]; then 
        echo -e "SDCARD\t: erasing partition 1..."
        fdisk $SD <<HEREERASE
d
w
HEREERASE
    fi

    echo -e "SDCARD\t: creating partition "
    fdisk $SD <<HEREFDISK
p
n
p
1
2048

t
b
p
a
1
p
w
HEREFDISK

    while true; do
        read -p "SDCARD  : Eject but do not remove SD card. Enter "y" when ready:" yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) exit;;
                * ) echo "        : Please answer yes or no.";;
        esac
    done
    sleep 1

    echo -e "SDCARD\t: formatting partition as FAT32..."
    CMD="mkfs.vfat ${SD}1"
    echo -e "SDCARD\t: $CMD"
    $CMD
    RC=$?;if [ "$RC" != "0" ]; then echo -e "ERROR\t: FAILED RC:$RC"; exit; fi 
    sync

    while true; do
        read -p "SDCARD  : Remove and reinsert SD card. Enter "y" when ready:" yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) exit;;
                * ) echo "        : Please answer yes or no.";;
        esac
    done
    sleep 1

    ZIP=`find . -name "NOOBS*.zip"`
    echo -e "ZIP\t: ${ZIP}"
    if [ -e "${ZIP}" ]; then
        echo -e "NOOBS\t: NOOBS found at ${ZIP}"
    else
        echo -e "NOOBS\t: NOOBS not found "
        echo -e "SDCARD\t: SDCARD is formatted but empty"
        exit
    fi

    SDDIR=`find / -name 'SD Card'`
    if [ -e $SDDIR ]; then
        echo -e "SDCARD\t: SD card found at $SDCARD"
    else 
        echo -e "SDCARD\t: No SD card found $SDCARD"
    fi
    ln -s -f -T "${SDDIR}" SDCard
    SDDIR=SDCard

    if [ -e "${SDDIR}" ]; then
        echo -e "SDCARD\t: SD Card found at ${SDDIR}"
    else
        echo -e "SDCARD\t: 'SD Card' not found "
        echo -e "SDCARD\t: SDCARD is formatted but empty"
        exit
    fi

    echo -e "SDCARD\t: expanding ${ZIP} to SDCARD"
    CMD="unzip -o -d ${SDDIR} ${ZIP}"
    echo -e "SDCARD\t: $CMD"
    $CMD
    #unzip -o -d ${SDDIR} ${ZIP}
    RC=$?;if [ "$RC" != "0" ]; then echo -e "ERROR\t: FAILED RC:$RC"; exit; fi 
    sync

    echo -e "SDCARD\t: Eject and remove SD card"
    echo -e "DONE\t: $0" `date`
} #format
format 2>&1 

exit 0
