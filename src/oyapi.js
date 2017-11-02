(function(exports) {
    const winston = require('winston');
    const EventEmitter = require("events");
    const srcPkg = require("../package.json");
    const OyaReactor = require("oya-vue").OyaReactor;
    const OyaVessel = require("oya-vue").OyaVessel;
    const OyaConf = require("oya-vue").OyaConf;
    const PmiAutomation = require("./drivers/pmi-automation");
    const path = require("path");
    const rpio = require("rpio");

	var count = 0;
	var curState = null;

    class OyaPi extends OyaReactor {
        constructor(name = "test", opts = {}) {
            super(name, Object.assign({
                srcPkg,
            }, opts));
            if (rpio) {
                winston.info("rpio available. Setting up PiMoroni Automation Hat...");
                var ahat = this.ahat = new PmiAutomation();
                ahat.enable();
                ahat.light.power.write(127);
                ahat.light.power.enable();
                ahat.light.comms.write(127);
                ahat.light.comms.enable();
                this.emitter.on(OyaPi.EVENT_RELAY, (value, pin) => {
                    ahat.light.power.enable(value);
                    rpio.open(pin, rpio.OUTPUT, value ? rpio.HIGH : rpio.LOW);
                });
                const pbtn = 37;
                rpio.open(pbtn, rpio.INPUT, rpio.PULL_DOWN);
                function btnPrime(pin) {
                    var pinState = rpio.read(pin);
                    var state = pinState ? 'pressed' : 'released' ;
                    if (curState !== state) {
                        curState && winston.info(`Priming mist system`);
                        this.vessel.setCycle(OyaVessel.CYCLE_PRIME);
                        curState = state;
                        ahat.light.comms.enable(pinState);
                        count++;
                    }
                }
                rpio.poll(pbtn, btnPrime);
            } else {
                winston.info("rpio not available.");
            }
        }

    } //// class OyaPi

    module.exports = exports.OyaPi = OyaPi;
})(typeof exports === "object" ? exports : (exports = {}));
