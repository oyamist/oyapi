(function(exports) {
    const winston = require('winston');
    const EventEmitter = require("events");
    const srcPkg = require("../package.json");
    const OyaReactor = require("oya-vue").OyaReactor;
    const OyaVessel = require("oya-vue").OyaVessel;
    const Sensor = require("oya-vue").Sensor;
    const Switch = require("oya-vue").Switch;
    const Light = require("oya-vue").Light;
    const SystemFacade = require("oya-vue").SystemFacade;
    const {
        OyaConf,
        OyaMist,
    } = require("oya-vue");
    const SQLite3 = require('sqlite3').verbose();
    const fs = require('fs');
    const PmiAutomation = require("./drivers/pmi-automation");
    const path = require("path");
    const rpio = require("rpio");

    function i2cWrite(adr, buf) {
        rpio.i2cBegin();
        rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
        rpio.i2cSetSlaveAddress(adr);
        var rc = rpio.i2cWrite(buf);
        rc && winston.debug(`i2cWrite(${adr}) => ${rc}`); // wakeup writes fail
        rpio.i2cEnd();
        return rc;
    }

    function i2cRead(adr, inBuf) {
        rpio.i2cBegin();
        rpio.i2cSetBaudRate(10000);    /* 10kHz for 10m cables */
        rpio.i2cSetSlaveAddress(adr);
        rpio.msleep(15);
        var rc = rpio.i2cRead(inBuf);
        rpio.i2cEnd();
        return rc;
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
            rpio.init({
                gpiomem: false,
            });
            if (this.oyaConf.mcuHat === OyaPi.MCU_HAT_PMI_AUTO_HAT.value) {
                var ahat = self.ahat = new PmiAutomation();
                winston.info(`OyaPi-${this.name}.init_rpio() Setting up PiMoroni Automation Hat`);
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
            } else if (this.oyaConf.mcuHat === OyaPi.MCU_HAT_PMI_AUTO_PHAT.value) {
                winston.info(`OyaPi-${this.name}.init_rpio() Setting up PiMoroni Automation Phat`);
            } else {
                winston.info(`OyaPi-${this.name}.init_rpio() Running without Raspberry Pi hats`);
            }
            winston.info(`OyaPi.init_rpio().emitter on:${OyaMist.EVENT_FAN_PWM}`);
            self.emitter.on(OyaMist.EVENT_FAN_PWM, (value, pin) => {
                try {
                    if (pin >= 0) {
                        var pwmMax = 16384;
                        rpio.open(pin, rpio.PWM); 
                        rpio.pwmSetClockDivider(64);    /* Set PWM refresh rate to 300kHz */
                        rpio.pwmSetRange(pin, pwmMax);
                        rpio.pwmSetData(pin, value*pwmMax);
                    }
                } catch (e) {
                    winston.error('oyapi:', e.stack);
                }
            });
            winston.info(`OyaPi.init_rpio().emitter on:${OyaPi.EVENT_RELAY}`);
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
                        winston.info(`OyaPi-${this.name}.initSwitches() Initializing rpio driver for ${sw}`);
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

        applyPmiHatCommon(confnew) {
            var sw = confnew.switches.filter(s=>s.event === OyaConf.EVENT_CYCLE_PRIME)[0];
            if (sw && Number(sw.pin) === -1) {
                sw.pin = 37;
                sw.type = Switch.ACTIVE_LOW;
                winston.info(`OyaPi-${this.name}.applyMcuHatDefaults() `, sw);
            }
            var light = confnew.lights.filter(a=>a.spectrum === Light.SPECTRUM_FULL)[0];
            if (light && Number(light.pin) === -1) {
                light.pin = 32;
                winston.info(`OyaPi-${this.name}.applyMcuHatDefaults() `, light);
            }
        }

        applyMcuHatDefaults(confnew) {
            if (confnew.mcuHat === this.oyaConf.mcuHat) {
                return confnew;
            }
            if (confnew.mcuHat === OyaPi.MCU_HAT_PMI_AUTO_HAT.value) {
                winston.info(`OyaPi-${this.name}.applyMcuHatDefaults() mcuHat:PMI Automation Hat`);
                this.applyPmiHatCommon(confnew);
                var act = confnew.actuators.filter(a=>a.activate === OyaVessel.EVENT_MIST)[0];
                if (act && Number(act.pin) === -1) {
                    act.pin = 33;
                    winston.info(`OyaPi-${this.name}.applyMcuHatDefaults() `, act);
                }
            } else if (confnew.mcuHat === OyaPi.MCU_HAT_PMI_AUTO_PHAT.value) {
                winston.info(`OyaPi-${this.name}.applyMcuHatDefaults() mcuHat:PMI Automation Phat`);
                this.applyPmiHatCommon(confnew);
                var act = confnew.actuators.filter(a=>a.activate === OyaVessel.EVENT_MIST)[0];
                if (act && Number(act.pin) === -1) {
                    act.pin = 36;
                    winston.info(`OyaPi-${this.name}.applyMcuHatDefaults() `, act);
                }
            }
            return confnew;
        }

        putOyaConf(req, res, next) {
            this.applyMcuHatDefaults(req.body.apiModel);
            return super.putOyaConf(req, res, next);
        }

        process_sensors() {
            const MAX_READ_ERRORS = 5;
            this.oyaConf.sensors.forEach(s=> {
                try {
                    if (s.type === Sensor.TYPE_NONE.type) {
                        winston.debug(`Sensor ${s.name} type:${s.type} (not configured)`);
                        return;
                    }

                    winston.debug(`Sensor ${s.name} type:${s.type} comm:${s.comm}`);
                    var mute = s.readErrors >= MAX_READ_ERRORS;
                    s.i2cRead = (adr,inBuf) => {
                        var rc = i2cRead(adr.inBuf);
                        if (rc) {
                            if (mute) {
                                winston.debug(`i2cRead(${adr}) => ${rc}`);
                            } else {
                                winston.warn(`i2cRead(${adr}) => ${rc}`);
                            }
                        }
                    }
                    s.i2cWrite = i2cWrite;
                    s.emitter = this.vessel.emitter;
                    s.read().then(r=>{
                        winston.debug(`sensor ${s.name} ${JSON.stringify(r)}`);
                    }).catch(e=>{
                        if (mute) {
                            winston.debug(`OyaPi.process_sensors()`,
                                `readErrors:#${s.readErrors} sensor:${s.name} error:`,
                                e.message);
                        } else {
                            winston.info(`OyaPi.process_sensors()`,
                                `readErrors:#${s.readErrors} sensor:${s.name} error:`,
                                e.message);
                        }
                        if (s.readErrors === MAX_READ_ERRORS) {
                            winston.warn(`sensor ${s.name}/${s.loc} errors muted (over ${MAX_READ_ERRORS} errors)`);
                        }
                    });
                } catch (e) {
                    winston.error(`process_sensors error sensor ${s.name}`, e.stack);
                }
            });
		}

        onApiModelLoaded(apiModel) {
            super.onApiModelLoaded(apiModel);
            winston.info(`OyaPi-${this.name}.onApiModelLoaded()`);
            if (rpio) {
                this.init_rpio();
            } else {
                winston.info(`OyaPi-${this.name}.onApiModelLoaded() rpio not available.`);
            }
        }

        onInitializeEvents(emitter, apiModel) {
            super.onInitializeEvents(emitter, apiModel);
            winston.info(`OyaPi-${this.name}.onInitializeEvents()`);
            this.initSwitches();
            var self = this;
            setInterval(() => {
                self.process_sensors();
            }, 1000);
            this.oyaConf.switches[0].emitTo(this.emitter, false);
        }

    } //// class OyaPi

    module.exports = exports.OyaPi = OyaPi;
})(typeof exports === "object" ? exports : (exports = {}));
