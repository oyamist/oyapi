#!/usr/bin/env node

var PmiAutomation;
try {
	PmiAutomation = require('../src/drivers/pmi-automation');
	console.log("Pimoroni Automation Hat");
} catch (e) {
	// do nothing
}
const rpio = require('rpio');

var ahat = PmiAutomation && new PmiAutomation();
ahat && ahat.enable();
ahat && ahat.light.power.on();
rpio.sleep(1);
ahat && ahat.light.power.enable(false);
ahat && ahat.light.power.write(127);

console.log("TEST\t: GPIO button test");

const pbtn = 37;
console.log("TEST\t: reading button ${pbtn} HIGH");
rpio.open(pbtn, rpio.INPUT, rpio.PULL_DOWN);
var count = 0;
var curState = null;
function pollcb(pin) {
	var pinState = rpio.read(pin);
	var state = pinState ? 'pressed' : 'released' ;
	if (curState !== state) {
		console.log(`${count} Button ${pin} is ${state}`);
		curState = state;
		ahat && ahat.light.power.enable(pinState);
		count++;
	}
}
rpio.poll(pbtn, pollcb);

