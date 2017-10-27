#!/usr/bin/env node
const rpio = require('rpio');
const Sensor = require("oya-vue").Sensor;
var sht31 = new Sensor(Sensor.TYPE_SHT31_DIS);

console.log("TEST\t: SHT31-DIS Temperature and Humidity Sensor Test");

const I2C_ADDRESS = sht31.address;
const BYTES_DATA_RESPONSE = 6;

rpio.i2cBegin();
rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
rpio.i2cSetSlaveAddress(I2C_ADDRESS);

for (var ia in process.argv) {
	if (process.argv[ia] === '-W') {
		//var rc = rpio.i2cWrite(Buffer(sht31.heater.on)); // heater on
		console.log(`TEST\t: heater on i2cWrite => ${rc}`);
		rpio.sleep(1);
	}
	if (process.argv[ia] === '-w') {
		//var rc = rpio.i2cWrite(Buffer(sht31.heater.off)); // heater off
		console.log(`TEST\t: heater off i2cWrite => ${rc}`);
		rpio.sleep(1);
	}
}

// read data
var rc = rpio.i2cWrite(Buffer(sht31.cmdRead));
console.log(`TEST\t: read command i2cWrite => ${rc}`);
var inBuf = Buffer.alloc(sht31.dataRead.length);
rpio.msleep(15);
var rc = rpio.i2cRead(inBuf);
console.log(`TEST\t: response rc:${rc} inBuf:`, 
	inBuf[0].toString(16), // Temp high
	inBuf[1].toString(16), // Temp low
	inBuf[2].toString(16), // CRC Temp
	inBuf[3].toString(16), // RH high
	inBuf[4].toString(16), // RH low
	inBuf[5].toString(16)); // CRC RH

var data = sht31.parseData(inBuf);
var temp = data.temp;
var humidity = data.humidity;
console.log(`TEST\t: RH:${humidity.toFixed(1)}% Temp:${temp.toFixed(1)}C ${(temp*1.8+32).toFixed(1)}F `);

rpio.i2cEnd();

