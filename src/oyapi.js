(function(exports) {
    const winston = require('winston');
    const EventEmitter = require("events");
    const srcPkg = require("../package.json");
    const OyaReactor = require("oya-vue").OyaReactor;
    const OyaVessel = require("oya-vue").OyaVessel;
    const Sensor = require("oya-vue").Sensor;
    const Switch = require("oya-vue").Switch;
    const SystemFacade = require("oya-vue").SystemFacade;
    const OyaConf = require("oya-vue").OyaConf;
    const SQLite3 = require('sqlite3').verbose();
    const PmiAutomation = require("./drivers/pmi-automation");
    const path = require("path");
    const rpio = require("rpio");

    function i2cWrite(adr, buf) {
        rpio.i2cBegin();
        rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
        rpio.i2cSetSlaveAddress(adr);
        var rc = rpio.i2cWrite(buf);
        rc && winston.warn(`i2cWrite(${adr}) => ${rc}`);
        rpio.i2cEnd();
    }

    function i2cRead(adr, inBuf) {
        rpio.i2cBegin();
        rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
        rpio.i2cSetSlaveAddress(adr);
        rpio.msleep(15);
        var rc = rpio.i2cRead(inBuf);
        rc && winston.warn(`i2cRead(${adr}) => ${rc}`);
        rpio.i2cEnd();
    }

	var curState = null;

    class OyaPi extends OyaReactor {
        constructor(name = "test", opts = {}) {
            super(name, Object.assign({
                srcPkg,
                i2cWrite,
                i2cRead,
            }, opts));
            var vessel = this.vessel;
        }

        static get MCU_HAT_PMI_AUTO_HAT() { return {
            text: 'PiMoroni Automation Hat (3 relays)',
            value: 'mcu-hat:pmi-auto-hat',
        }}
        static get MCU_HAT_PMI_AUTO_PHAT() { return {
            text: 'PiMoroni Automation Phat (1 relay)',
            value: 'mcu-hat:pmi-auto-phat',
        }}

        init_rpio() {
            var self = this;
            winston.info("rpio available. Setting up PiMoroni Automation Hat...");
            if (this.oyaConf.mcuHat === OyaPi.MCU_HAT_PMI_AUTO_HAT) {
                var ahat = self.ahat = new PmiAutomation();
                winston.info('OyaPi.init_rpio() Setting up PiMoroni Automation Hat');
            } else if (this.oyaConf.mcuHat === OyaPi.MCU_HAT_PMI_AUTO_PHAT) {
                var ahat = self.ahat = new PmiAutomation();
                winston.info('OyaPi.init_rpio() Setting up PiMoroni Automation Phat');
            } else {
                winston.info('OyaPi.init_rpio() Running without Raspberry Pi hats');
            }
            if (self.ahat) {
                ahat.enable();
                ahat.light.power.write(127);
                ahat.light.comms.write(127);
                ahat.light.warn.write(127);
                ahat.light.power.enable();
                ahat.light.comms.enable();
                ahat.light.warn.enable();
                setTimeout(() => ahat.light.power.enable(false), 500);
                setTimeout(() => ahat.light.comms.enable(false), 1000);
                setTimeout(() => ahat.light.warn.enable(false), 1500);
            }
            self.emitter.on(OyaPi.EVENT_RELAY, (value, pin) => {
                try {
                    if (pin >= 0) {
                        rpio.open(pin, rpio.OUTPUT, value ? rpio.HIGH : rpio.LOW);
                    }
                } catch(e) {
                    winston.error('oyapi:', e.stack);
                }
                //ahat.light.power.enable(value);
            });
        }

        getMcuHats() {
            return [
                OyaPi.MCU_HAT_PMI_AUTO_HAT,
                OyaPi.MCU_HAT_PMI_AUTO_PHAT,
                OyaConf.MCU_HAT_NONE,
            ];
        }

        initSwitches() {
            this.oyaConf.switches.forEach(sw=>{
                if (sw.pin >= 0) {
                    try {
                        winston.info(`OyaPi.initSwitches() Initializing rpio driver for pin:${sw.pin} ${sw.type} ${sw.event}`);
                        var activeHigh = (sw.type === Switch.ACTIVE_HIGH);
                        rpio.open(sw.pin, rpio.INPUT, activeHigh ? rpio.PULL_DOWN : rpio.PULL_UP);
                        rpio.poll(sw.pin, (pin) => {
                            try {
                                var pinState = rpio.read(pin);
                                var state = pinState ? 'pressed' : 'released' ;
                                if (curState !== state) { // debounce
                                    curState = state;
                                    var active = sw.emitTo(this.emitter, pinState);
                                    this.ahat && this.ahat.light.comms.enable(active);
                                    winston.info(`Switch:${sw.name} pin:${sw.pin} active:${active}`);
                                }
                            } catch(e) {
                                winston.error(`Cannot handle switch poll ${sw.name} pin:${sw.pin}`, e.stack);
                            }
                        });
                    } catch (e) {
                        winston.error(`Cannot set up switch ${sw.name} pin:${sw.pin}`, e.stack);
                    }
                }
            });
        }

		process_sensors() {
            try {
                this.oyaConf.sensors.forEach(s=> {
                    if (s.type === Sensor.TYPE_NONE.type || s.pin == null || s.pin < 0) {
                        winston.debug(`Sensor ${s.name} pin:${s.pin} type:${s.type} (not configured)`);
                        return;
                    }
                    winston.info(`Sensor ${s.name} pin:${s.pin} type:${s.type} comm:${s.comm}`);
                    if (s.comm === Sensor.COMM_I2C) {
                        s.i2cRead = i2cRead;
                        s.i2cWrite = i2cWrite;
                        s.emitter = this.vessel.emitter;
                        const MAX_READ_ERRORS = 5;
                        if (s.readErrors < MAX_READ_ERRORS) {
                            s.read().then(r=>{
                                winston.debug(`sensor ${s.name} ${JSON.stringify(r)}`);
                            }).catch(e=>{
                                winston.info(`read error #${s.readErrors} sensor ${s.name}`, e);
                                if (s.readErrors === MAX_READ_ERRORS) {
                                    winston.error(`sensor ${s.name}/${s.loc} disabled (too many errors)`);
                                }
                            });
                        }
                    }
                });
            } catch (e) {
                winston.error(`process_sensors error sensor ${s.name}`, e);
            }
		}

        onApiModelLoaded() {
            super.onApiModelLoaded();
            if (rpio) {
                this.init_rpio();
            } else {
                winston.info("rpio not available.");
            }
            this.initSwitches();
            winston.info("OyaPi onApiModelLoaded");
            var self = this;
            setInterval(() => {
                self.process_sensors();
            }, 1000);
            this.oyaConf.switches[0].emitTo(this.emitter, false);
        }

    } //// class OyaPi

    module.exports = exports.OyaPi = OyaPi;
})(typeof exports === "object" ? exports : (exports = {}));
