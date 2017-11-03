(function(exports) {
    const winston = require('winston');
    const EventEmitter = require("events");
    const srcPkg = require("../package.json");
    const OyaReactor = require("oya-vue").OyaReactor;
    const OyaVessel = require("oya-vue").OyaVessel;
    const Sensor = require("oya-vue").Sensor;
    const OyaConf = require("oya-vue").OyaConf;
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

	var count = 0;
	var curState = null;

    class OyaPi extends OyaReactor {
        constructor(name = "test", opts = {}) {
            super(name, Object.assign({
                srcPkg,
                i2cWrite,
                i2cRead,
            }, opts));
            if (rpio) {
                this.init_rpio();
            } else {
                winston.info("rpio not available.");
            }
        }

        init_rpio() {
            var self = this;
            winston.info("rpio available. Setting up PiMoroni Automation Hat...");
            var ahat = self.ahat = new PmiAutomation();
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
            self.emitter.on(OyaPi.EVENT_RELAY, (value, pin) => {
                ahat.light.power.enable(value);
                rpio.open(pin, rpio.OUTPUT, value ? rpio.HIGH : rpio.LOW);
            });
            const pbtn = 37;
            rpio.open(pbtn, rpio.INPUT, rpio.PULL_DOWN);
            rpio.poll(pbtn, (pin) => {
                var pinState = rpio.read(pin);
                var state = pinState ? 'pressed' : 'released' ;
                if (curState !== state) {
                    if (curState) {
                        winston.info(`Priming mist system`);
                        self.vessel.setCycle(OyaVessel.CYCLE_PRIME);
                    }
                    curState = state;
                    ahat.light.comms.enable(pinState);
                    count++;
                }
            });
        }

		process_sensors() {
            try {
                this.oyaConf.sensors.forEach(s=> {
                    if (s.type !== Sensor.TYPE_NONE.type) {
                        s.i2cRead = i2cRead;
                        s.i2cWrite = i2cWrite;
                        s.emitter = this.vessel.emitter;
                        const MAX_READ_ERRORS = 5;
                        if (s.readErrors < MAX_READ_ERRORS) {
                            s.read().then(r=>{
                                winston.debug(`sensor ${s.name} ${JSON.stringify(r)}`);
                            }).catch(e=>{
                                winston.error(`read error #${s.readErrors} sensor ${s.name}`, e);
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
            winston.info("OyaPi onApiModelLoaded");
            var self = this;
            setInterval(() => {
                self.process_sensors();
            }, 1000);
        }

    } //// class OyaPi

    module.exports = exports.OyaPi = OyaPi;
})(typeof exports === "object" ? exports : (exports = {}));
