#!/usr/bin/env node

console.log("TEST\t: SHT31-D Temperature and Humidity Sensor Test");

const rpio = require('rpio');

const I2C_ADDRESS = 0x44;
const BYTES_DATA = 4;
const BYTES_DATA_RESPONSE = 6;

rpio.i2cBegin();
rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
var rc = rpio.i2cSetSlaveAddress(I2C_ADDRESS);
console.log(`i2cSetSlaveAddress => ${rc}`);

// read data
var rc = rpio.i2cWrite(Buffer([0x24, 0x00]));
console.log(`i2cWrite => ${rc}`);
rpio.msleep(50);
var inBuf = Buffer.alloc(BYTES_DATA_RESPONSE);
var rc = rpio.i2cRead(inBuf);
console.log(`i2cRead => ${rc}`);
console.log("response", 
	inBuf[0].toString(16), // Temp high
	inBuf[1].toString(16), // Temp low
	inBuf[2].toString(16), // CRC Temp
	inBuf[3].toString(16), // RH high
	inBuf[4].toString(16), // RH low
	inBuf[5].toString(16)); // CRC RH

var RHraw = (inBuf[3]<<8) | inBuf[4];
var RH = 100.0 * RHraw / 65535.0;
var TempRaw = (inBuf[0]<<8) | inBuf[1];
var Temp = -45.0 + 175*TempRaw / 65535.0;
Temp = Math.round(Temp*10)/10;
var CRC = (inBuf[2]<<8) | inBuf[5];

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


console.log(`RHraw:${RHraw} RH:${Math.round(RH*10)/10}% Temp:${Temp}C ${Math.round(Temp*18)/10+32}F CRC:${CRC} crc:${crc==CRC ? "ok" : "BAD"} `);
rpio.i2cEnd();
