#!/usr/bin/env node

console.log("TEST\t: Atlas Scientific EC_EZO Sensor Test");

const rpio = require('rpio');

const I2C_ADDRESS = 0x64;
const CMD_READ_SENSE = 0x52; // 'R'
const CMD_READ_INFO = 0x49; // 'I'
const READ_MS = 600;
const BYTES_SENSE_RESPONSE = 7;
const BYTES_INFO_RESPONSE = 12;

rpio.init({
    gpiomem: false,
});
rpio.i2cBegin();
rpio.i2cSetBaudRate(100000);    /* 100kHz minimum speed. Cable length < 500mm */
var rc = rpio.i2cSetSlaveAddress(I2C_ADDRESS);
console.log(`i2cSetSlaveAddress$({I2C_ADDRESS}) => ${rc}`);

// read info
var rc = rpio.i2cWrite(Buffer([CMD_READ_INFO]));
console.log(`i2cWrite => ${rc}`);
var inBuf = Buffer.alloc(BYTES_INFO_RESPONSE);
rpio.msleep(READ_MS);
var rc = rpio.i2cRead(inBuf);
console.log(`i2cRead => ${rc}`);
if (inBuf[0] === 1 && inBuf[inBuf.length-1] === 0) {
    console.log("response", 
        inBuf.toString("utf8", 0, inBuf.length-2), // ASCII 
        "OK");
} else {
    console.log("response ", 
        inBuf[0].toString(16),
        inBuf[1].toString(16),
        inBuf[2].toString(16),
        inBuf[3].toString(16),
        inBuf[4].toString(16),
        inBuf[5].toString(16),
        inBuf[6].toString(16),
        inBuf[7].toString(16),
        inBuf[8].toString(16),
        inBuf[9].toString(16),
        inBuf[10].toString(16),
        inBuf[11].toString(16),
        "ERROR");
}

// read data
var rc = rpio.i2cWrite(Buffer([CMD_READ_SENSE]));
console.log(`i2cWrite => ${rc}`);
var inBuf = Buffer.alloc(BYTES_SENSE_RESPONSE);
rpio.msleep(READ_MS);
var rc = rpio.i2cRead(inBuf);
console.log(`i2cRead => ${rc}`);
if (inBuf[0] === 1 && inBuf[inBuf.length-1] === 0) {
    var reading = inBuf.toString("utf8", 1, inBuf.length-1).replace(/\0/g,'');
    var ec = Number(reading);
    var ppm = (ec / 1.56).toFixed(1);
    console.log("response", 
        `0x${inBuf[0].toString(16)}`,
        `0x${inBuf[1].toString(16)}`,
        `0x${inBuf[2].toString(16)}`,
        `0x${inBuf[3].toString(16)}`,
        `0x${inBuf[4].toString(16)}`,
        `0x${inBuf[5].toString(16)}`,
        `0x${inBuf[6].toString(16)}`,
        reading,
        typeof reading,
        ec, "ec",
        ppm, "ppm",
        inBuf[0] === 1 ? "OK" : "ERR");
} else {
    console.log("response ", 
        inBuf[0].toString(16),
        inBuf[1].toString(16),
        inBuf[2].toString(16),
        inBuf[3].toString(16),
        inBuf[4].toString(16),
        inBuf[5].toString(16),
        "ERROR");
}

rpio.i2cEnd();

/*
var RH = (inBuf[2]<<8) | inBuf[3];
var Temp = (inBuf[4]<<8) | inBuf[5];
var CRC = (inBuf[7]<<8) | inBuf[6];

var crc = 0xffff;
for (var i=0; i<6; i++) {
	crc ^= inBuf[i];
	for (var j=0; j<8; j++) {
		if (crc & 0x01) {
			crc >>= 1;
			crc ^= 0xa001;
		} else {
			crc >>= 1;
		}
	}
}


console.log(`RH:${RH/10}% Temp:${Temp/10}C ${Math.round(Temp*1.8)/10+32}F CRC:${CRC} crc:${crc==CRC ? "ok" : "BAD"} `);
*/
