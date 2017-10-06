#!/usr/bin/env node

(function(exports) {
    const rpio = require('rpio');
	const winston = require("winston");

    class Light {
        constructor(name, ahat) {
            this.name = name;
            this.led = ahat.leds.length;
            this.value = 1;
            this.enabled = false;
            this.ahat = ahat;
        }

		enable(value=true) {
			this.enabled = value;
		}

        write(value) {
            this.value = Math.max(0, Math.min(value, 255));
            this.ahat.updateLeds();
        }

		on() {
			this.enabled = true;
            this.ahat.updateLeds();
		}

		off() {
			this.enabled = false;
            this.ahat.updateLeds();
		}

		toggle() {
			if (this.enabled) {
				this.off();
			} else {
				this.on();
			}
        }
    }

    class Relay {
		constructor(name, pin) {
			this.name = name;
			this.nc = {};
			this.no = {};
			this._auto_light = true;
			this.value = false;
			this.pin = pin;
		}

		auto_light(value=true) {
			this._auto_light = value;
			this.nc.light.enable(value);
			this.no.light.enable(value);
		}

		write(value) {
			this.value = !!value;
			rpio.open(this.pin, rpio.OUTPUT, value ? rpio.HIGH : rpio.LOW);
			this.no.light.enable(this._auto_light && !this.value);
			this.nc.light.enable(this._auto_light && this.value);
			if (value) {
				this.no.light.off();
				this.nc.light.on();
			} else {
				this.no.light.on();
				this.nc.light.off();
			}
		}

		on() {
			this.write(1);
		}

		off() {
			this.write(0);
		}

		toggle() {
			this.write(!this.value);
		}
	}

    // OyaPi Driver for Pimoroni Automation Hat
    class PmiAutomation {
        constructor(opts = {}) {
            this.baudRate = opts.baudRate || 10000; /* 10kHz for 10m cables */
            this.leds = [];
            this.light = {};
            this.analog = {
                one: {},
                two: {},
                three: {},
            };
            this.output = {
                one: {},
                two: {},
                three: {},
            };
            this.input = {
                one: {},
                two: {},
                three: {},
            };
            this.relay = {
                one: new Relay("RELAY1", 33),
                two: new Relay("RELAY2", 35),
                three: new Relay("RELAY3", 36),
            };
            this.leds.push((this.analog.one.light = new Light("ADC1", this))); // 0
            this.leds.push((this.analog.two.light = new Light("ADC2", this))); // 1
            this.leds.push((this.analog.three.light = new Light("ADC3", this))); // 2
            this.leds.push((this.output.one.light = new Light("OUTPUT1", this))); // 3
            this.leds.push((this.output.two.light = new Light("OUTPUT2", this))); // 4
            this.leds.push((this.output.three.light = new Light("OUTPUT3", this))); // 5
            this.leds.push((this.relay.one.no.light = new Light("RELAY1NO", this))); // 6
            this.leds.push((this.relay.one.nc.light = new Light("RELAY1NC", this))); // 7
            this.leds.push((this.relay.two.no.light = new Light("RELAY2NO", this))); // 8
            this.leds.push((this.relay.two.nc.light = new Light("RELAY2NC", this))); // 9
            this.leds.push((this.relay.three.no.light = new Light("RELAY3NO", this))); // 10
            this.leds.push((this.relay.three.nc.light = new Light("RELAY3NC", this))); // 11
            this.leds.push((this.input.three.light = new Light("INPUT3", this))); // 12
            this.leds.push((this.input.two.light = new Light("INPUT2", this))); // 13
            this.leds.push((this.input.one.light = new Light("INPUT1", this))); // 14
            this.leds.push((this.light.warn = new Light("WARN", this)));
            this.leds.push((this.light.comms = new Light("COMMS", this)));
            this.leds.push((this.light.power = new Light("POWER", this)));
			this.enabled = false;
        }

        static get I2C_ADDRESS() { return 0x54; }
        static get CMD_ENABLE_OUTPUT() { return 0x00; }
        static get CMD_SET_PWM_VALUES() { return 0x01; }
        static get CMD_ENABLE_LEDS() { return 0x13; }
        static get CMD_UPDATE() { return 0x16; }
        static get CMD_RESET() { return 0x17; }

        enable(value = true) {
			rpio.i2cBegin();
			rpio.i2cSetBaudRate(this.baudRate);    
			rpio.i2cSetSlaveAddress(PmiAutomation.I2C_ADDRESS);
			rpio.i2cWrite(Buffer([PmiAutomation.CMD_ENABLE_OUTPUT, value ? 1 : 0]));
			this.enabled = value;
        }

        updateLeds() {
            var enableLeds = [PmiAutomation.CMD_ENABLE_LEDS, 0x0, 0x0, 0x0];
            var pwm = [PmiAutomation.CMD_SET_PWM_VALUES];
			var mask = 0x20;
            this.leds.forEach((led, i) => {
                pwm.push(led.value);
				if (i % 6 === 0) {
					mask = 0x01;
				}
                if (led.enabled) {
					var ienable = Math.trunc(i/6) + 1;
                    enableLeds[ienable] |= mask;
                }
				mask <<= 1;
            });

			rpio.i2cBegin();
			rpio.i2cSetBaudRate(this.baudRate);    
			rpio.i2cSetSlaveAddress(PmiAutomation.I2C_ADDRESS);
			rpio.i2cWrite(Buffer([PmiAutomation.CMD_ENABLE_OUTPUT, 1]));

            var rc = rpio.i2cWrite(Buffer(enableLeds));
            if (rc) {
				throw new Error("could not write i2c");
            }
            var rc = rpio.i2cWrite(Buffer(pwm));
            if (rc) {
				throw new Error("could not write i2c");
            }
			var rc = rpio.i2cWrite(Buffer([PmiAutomation.CMD_UPDATE, 0xFF]));
            if (rc) {
				throw new Error("could not write i2c");
            }
        }
    
    } // class PmiAutomation

    module.exports = exports.PmiAutomation = PmiAutomation;
})(typeof exports === "object" ? exports : (exports = {}));
