#!/usr/bin/env node
console.log("mist\t: Starting OyaMist bioreactor", new Date());

var cycle = "30/60";
process.argv.forEach((a,i) => {
    if (a === '-c') {
        cycle = process.argv[i+1] || cycle;
    }
});
var cycleTokens = cycle.split("/");
var onSec = Number(cycleTokens[0]) || 30;
var offSec = Number(cycleTokens[1]) || 60;

console.log(`mist\t: misting cycle on:${onSec}s off:${offSec}s`);

try {
    const rpio = require('rpio');

    console.log("TEST\t: GPIO 2 (Pin 3) LOW");
    rpio.open(3, rpio.OUTPUT, rpio.LOW);
    console.log("TEST\t: GPIO 3 (Pin 5) HIGH");
    rpio.open(5, rpio.OUTPUT, rpio.HIGH);

    var msLast = new Date();
    var state = rpio.LOW;
    setInterval(() => {
        rpio.write(5, state);
        if (state === rpio.HIGH) {
            state = rpio.LOW;
            console.log("TEST\t: GPIO 3 (Pin 5) LOW");
        } else {
            state = rpio.HIGH;
            console.log("TEST\t: GPIO 3 (Pin 5) HIGH");
        }
    }, 5000);
} catch (err) {
    console.log("error", err, err.stack);
    throw err;
}

console.log("TEST\t: GPIO blink test END");
