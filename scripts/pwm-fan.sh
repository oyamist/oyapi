#!/usr/bin/env node

console.log("TEST\t: PWM fan test (pin 12)");

const rpio = require('rpio');

rpio.init({
    gpiomem: false,
});
rpio.i2cBegin();
rpio.i2cSetBaudRate(10000);    /* 100kHz minimum speed. Cable length < 500mm */

var seconds = 5;
var speeds = [
    0.1,
    0.3,
    0.4,
    0.5,
    0.6,
    0.7,
    0.8,
    0.9,
    1,
    0,
];

var pwmMax = 16384;
rpio.open(12, rpio.PWM); /* Use pin 12 */
rpio.pwmSetClockDivider(64);    /* Set PWM refresh rate to 300kHz */
rpio.pwmSetRange(12, pwmMax);

speeds.forEach(s => {
    console.log(`${(s*100).toFixed(1)}%`);
    rpio.pwmSetData(12, s*pwmMax);
    rpio.msleep(seconds*1000);
});

rpio.i2cEnd();
