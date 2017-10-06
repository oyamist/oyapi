#!/usr/bin/env node

(function(exports) {
    const rpio = require('rpio');

    class Light {
        constructor(name, pmia) {
            this.name = name;
            this.led = pmia.leds.length;
            this.value = 255;
            this.enabled = false;
            this.pmia = pmia;
        }

        write(value) {
            this.value = Math.max(0, Math.min(value, 255));
            this.pmia.updateLeds();
        }

        toggle() {
            this.enabled = !this.enabled;
            this.pmia.updateLeds();
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
                one: {},
                two: {},
                three: {},
            };
            this.leds.push((this.analog.one.light = new Light("ADC1", this)));
            this.leds.push((this.analog.two.light = new Light("ADC2", this));)
            this.leds.push((this.analog.three.light = new Light("ADC3", this)));
            this.leds.push((this.output.one.light = new Light("OUTPUT1", this)));
            this.leds.push((this.output.two.light = new Light("OUTPUT2", this));)
            this.leds.push((this.output.three.light = new Light("OUTPUT3", this)));
            this.leds.push((this.input.one.light = new Light("INPUT1", this)));
            this.leds.push((this.input.two.light = new Light("INPUT2", this)));
            this.leds.push((this.input.three.light = new Light("INPUT3", this)));
            this.leds.push((this.relay.one.light = new Light("RELAY1", this)));
            this.leds.push((this.relay.two.light = new Light("RELAY2", this)));
            this.leds.push((this.relay.three.light = new Light("RELAY3", this)));
            this.leds.push((this.light.warn = new Light("WARN", this)));
            this.leds.push((this.light.comms = new Light("COMMS", this)));
            this.leds.push((this.light.power = new Light("POWER", this)));
        }

        static get I2C_ADDRESS() { return 0x54; }
        static get CMD_ENABLE_OUTPUT() { return 0x00; }
        static get CMD_SET_PWM_VALUES() { return 0x01; }
        static get CMD_ENABLE_LEDS() { return 0x13; }
        static get CMD_UPDATE() { return 0x16; }
        static get CMD_RESET() { return 0x17; }

        enable(value = true) {
            if (value) {
                rpio.i2cBegin();
                rpio.i2cSetBaudRate(this.baudRate);    
                rpio.i2cSetSlaveAddress(I2C_ADDRESS);
                rpio.i2cWrite(Buffer([CMD_ENABLE_OUTPUT, value ? 1 : 0]));
            } else {
                rpio.i2cEnd();
            }
        }

        updateLeds() {
            var enable = [CMD_ENABLE_LEDS, 0, 0, 0];
            var pwm = [CMD_UPDATE];
            this.leds.forEach((led, i) => {
                var ienable = Math.trunc(i/6) + 1;
                pwm.push(led.value);
                enable[ienable] <<= 1;
                if (led.enabled) {
                    enable[ienable] |= 1;
                }
            });

            rpio.i2cBegin();
            rpio.i2cSetBaudRate(this.baudRate);    
            rpio.i2cSetSlaveAddress(I2C_ADDRESS);

            var rc = rpio.i2cWrite(Buffer(enable));
            if (rc) {
                return false;
            }
            var rc = rpio.i2cWrite(Buffer(pwm));
            if (rc) {
                return false;
            }
        }
    
    } // class PmiAutomation

    module.exports = exports.PmiAutomation = PmiAutomation;
})(typeof exports === "object" ? exports : (exports = {}));
