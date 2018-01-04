#!/usr/bin/env node

console.log("TEST\t: AM2315 Temperature and Humidity Sensor Test");

const rpio = require('rpio');

const I2C_ADDRESS = 0x5C;
const CMD_READ_DATA = 0x03;
const ADDR_RH = 0x00;
const BYTES_RH_TEMP = 4;
const BYTES_RH_TEMP_RESPONSE = 8;

rpio.init({
    gpioimem: false,
});
rpio.i2cBegin();
rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
var rc = rpio.i2cSetSlaveAddress(I2C_ADDRESS);
console.log(`i2cSetSlaveAddress => ${rc}`);

// wakeup sensor
var rc = rpio.i2cWrite(Buffer([CMD_READ_DATA, ADDR_RH, BYTES_RH_TEMP]));
console.log(`i2cWrite (wakeup)=> ${rc}`);

// read data
var rc = rpio.i2cWrite(Buffer([CMD_READ_DATA, ADDR_RH, BYTES_RH_TEMP]));
console.log(`i2cWrite => ${rc}`);
var inBuf = Buffer.alloc(BYTES_RH_TEMP_RESPONSE);
var rc = rpio.i2cRead(inBuf);
console.log(`i2cRead => ${rc}`);
console.log("response", 
	inBuf[0].toString(16), // command
	inBuf[1].toString(16), // length
	inBuf[2].toString(16), // RH high
	inBuf[3].toString(16), // RH low
	inBuf[4].toString(16), // Temp high
	inBuf[5].toString(16), // Temp low
	inBuf[6].toString(16), // CRC Low
	inBuf[7].toString(16)); // CRC High

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
rpio.i2cEnd();
