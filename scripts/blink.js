#!/usr/bin/env node
console.log("TEST\t: GPIO blink test START");

const rpio = require('rpio');
const pbtn = 37;
console.log("TEST\t: reading button ${pbtn} HIGH");
rpio.open(pbtn, rpio.INPUT, rpio.PULL_UP);
var count = 0;
var button = null;
function pollcb(pin) {
	var state = rpio.read(pin) ? 'released' : 'pressed';
	if (button !== state) {
		console.log(`${count} Button ${pin} is ${state}`);
		button = state;
		count++;
	}
}
rpio.poll(pbtn, pollcb);

const pinRelay1 = 33;

console.log("TEST\t: (Pin pinRelay1) HIGH");
rpio.open(pinRelay1, rpio.OUTPUT, rpio.HIGH);

if (true) {
	var msLast = new Date();
	var state = rpio.LOW;
	setInterval(() => {
		rpio.write(pinRelay1, state);
		if (state === rpio.HIGH) {
			state = rpio.LOW;
			console.log("TEST\t: (Pin pinRelay1) LOW");
		} else {
			state = rpio.HIGH;
			console.log("TEST\t: (Pin pinRelay1) HIGH");
		}
	}, 5000);
}


console.log("TEST\t: GPIO blink test END");
