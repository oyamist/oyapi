#!/usr/bin/env node
const rpio = require('rpio');
const Sensor = require("oya-vue").Sensor;
const winston = require('winston');
const fs = require('fs');
const path = require('path');

var w1 = '/sys/bus/w1/devices';
var devices = fs.readdirSync(w1).filter(f=>f.startsWith('28'));

if (devices.length === 0) {
    console.log('no 1-wire devices');
    process.exit(-1);
}
console.log('devices',devices);
devices.forEach(dev=>{
    var f = path.join(w1,dev,"w1_slave");
    setInterval(() => {
        fs.readFile(f,(e,d) =>{
            if (e) {
                console.log(`could not read ${f}`);
            } else {
                var lines = d.toString().split('\n');
                if (lines[0].match(/YES/)) {
                    var tokens = lines[1].split('=');
                    var tc = Number(tokens[tokens.length-1])/1000;
                    var tf = tc*1.8+32;
                    console.log(`${f} => ${tf.toFixed(2)} ${lines[0].substr(-10)}`);
                } else {
                    console.log(`Sensor read failed ${f} => ${d.toString()}`);
                }
            }
        });
    }, 1000);
});
