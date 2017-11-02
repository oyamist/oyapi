#!/usr/bin/env node
const rpio = require('rpio');
const Sensor = require("oya-vue").Sensor;
const winston = require('winston');
var opts = Object.assign({
	i2cWrite: (adr, buf)=>{
		rpio.i2cBegin();
		rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
		rpio.i2cSetSlaveAddress(adr);
		var rc = rpio.i2cWrite(buf);
		winston.info(`i2cWrite => ${rc}`);
		rpio.i2cEnd();
	},
	i2cRead: (adr, inBuf)=>{
		rpio.i2cBegin();
		rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
		rpio.i2cSetSlaveAddress(adr);
		rpio.msleep(15);
		var rc = rpio.i2cRead(inBuf);
		rpio.i2cEnd();
	},
}, Sensor.TYPE_SHT31_DIS);

var sht31 = new Sensor(opts);

winston.info("SHT31-DIS Temperature and Humidity Sensor Test");

rpio.i2cBegin();
rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
rpio.i2cSetSlaveAddress(sht31.address);

for (var ia in process.argv) {
	if (process.argv[ia] === '-W') {
		var rc = rpio.i2cWrite(Buffer(sht31.heater.on)); // heater on
		winston.info(`heater on i2cWrite => ${rc}`);
		rpio.sleep(1);
	}
	if (process.argv[ia] === '-w') {
		var rc = rpio.i2cWrite(Buffer(sht31.heater.off)); // heater off
		winston.info(`heater off i2cWrite => ${rc}`);
		rpio.sleep(1);
	}
}

// read data
var rc = rpio.i2cWrite(Buffer(sht31.cmdRead));
winston.info(`read command i2cWrite => ${rc}`);
var inBuf = Buffer.alloc(sht31.dataRead.length);
rpio.msleep(15);
var rc = rpio.i2cRead(inBuf);
winston.info(`response rc:${rc} inBuf:`, 
	inBuf[0].toString(16), // Temp high
	inBuf[1].toString(16), // Temp low
	inBuf[2].toString(16), // CRC Temp
	inBuf[3].toString(16), // RH high
	inBuf[4].toString(16), // RH low
	inBuf[5].toString(16)); // CRC RH

var data = sht31.parseData(inBuf);
var temp = data.temp;
var humidity = data.humidity;
winston.info(`RH:${humidity.toFixed(1)}% Temp:${temp.toFixed(1)}C ${(temp*1.8+32).toFixed(1)}F `);

sht31.read().then(r=>{
	winston.info(`sht31.read() => ${JSON.stringify(r)}`);
}).catch(e=>{
	winston.error(e);
});

rpio.i2cEnd();

