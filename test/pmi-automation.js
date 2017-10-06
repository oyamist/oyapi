#!/usr/bin/env node

(typeof describe === 'function') && describe("PmiAutomation", function() {
	const should = require('should');
	const winston = require("winston");
	const PmiAutomation = require("../index").drivers.PmiAutomation
	winston.level =  'debug';

    const rpio = require('rpio');

	it("turns on an led", function(done) {
		this.timeout(10000);
		var async = function*(){
			try {
				var ahat = new PmiAutomation();
				var ms = 50;
				ahat.enable();
				ahat.analog.one.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.analog.two.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.analog.three.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.output.one.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.output.two.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.output.three.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.input.one.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.input.two.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.input.three.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.one.no.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.one.nc.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.two.no.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.two.nc.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.three.no.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.three.nc.light.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.light.warn.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.light.comms.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.light.power.on();
				yield setTimeout(()=>async.next(), ms);

				var level = 20;
				ahat.analog.one.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.analog.two.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.analog.three.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.output.one.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.output.two.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.output.three.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.input.one.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.input.two.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.input.three.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.one.no.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.one.nc.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.two.no.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.two.nc.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.three.no.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.three.nc.light.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.light.warn.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.light.comms.write(level);
				yield setTimeout(()=>async.next(), ms);
				ahat.light.power.write(level);
				yield setTimeout(()=>async.next(), ms);

				ahat.leds.forEach(led => led.toggle());
				yield setTimeout(()=>async.next(), 500);
				ahat.leds.forEach(led => led.toggle());
				yield setTimeout(()=>async.next(), 500);

				ahat.enable(false);
				done();
			} catch (err) {
				winston.warn(err.stack);
			}
		}();
		async.next();
	});
	it("turns on a relay", function(done) {
		this.timeout(10000);
		var async = function*(){
			try {
				var ahat = new PmiAutomation();
				var ms = 500;
				ahat.enable();
				ahat.relay.one.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.two.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.three.on();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.one.off();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.two.off();
				yield setTimeout(()=>async.next(), ms);
				ahat.relay.three.off();
				yield setTimeout(()=>async.next(), ms);

				ahat.enable(false);
				done();
			} catch (err) {
				winston.warn(err.stack);
			}
		}();
		async.next();
	});

});
