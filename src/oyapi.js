(function(exports) {
    const winston = require('winston');
    const EventEmitter = require("events");
    const srcPkg = require("../package.json");
    const OyaReactor = require("oya-vue").OyaReactor;
    const OyaConf = require("oya-vue").OyaConf;
    const path = require("path");
    const rpio = require("rpio");

    class OyaPi extends OyaReactor {
        constructor(name = "test", opts = {}) {
            super(name, Object.assign({
                srcPkg,
            }, opts));
            if (rpio) {
                oya.emitter.on(OyaPi.EVENT_RELAY, (value, pin) => {
                    rpio.open(pin, rpio.OUTPUT, value ? rpio.HIGH : rpio.LOW);
                });
            }
        }

    } //// class OyaPi

    module.exports = exports.OyaPi = OyaPi;
})(typeof exports === "object" ? exports : (exports = {}));
