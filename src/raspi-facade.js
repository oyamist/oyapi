(function(exports) {
    const winston = require('winston');
    const EventEmitter = require("events");
    const srcPkg = require("../package.json");
    const SystemFacade = require("oya-vue").SystemFacade;
    const SQLite3 = require('sqlite3').verbose();
    const PmiAutomation = require("./drivers/pmi-automation");
    const path = require("path");
    const fs = require('fs');
    const rpio = require("rpio");

    const W1DIR = '/sys/bus/w1/devices';

    class RaspiFacade extends SystemFacade {
        constructor(opts = {}) {
            super(opts);
            fs.readdir(W1DIR, (err, files) => {
                if (err) {
                    this.w1Addresses = ["28-MOCK1","28-MOCK2"];
                    winston.info(`1-wire interface not available--using mock data [${this.w1Addresses}]. (${err.message}) `);
                } else {
                    this.w1Addresses = files.filter(f=>f.startsWith('28-'));
                    winston.info(`1-wire devices:${this.w1Addresses}`);
                }
            });
        }
        parseDS18B20(err,data) {
            if (err) {
                return Promise.reject(e);
            } else {
                var re = new RegExp(/.*\n.*t=([0-9,]+).*\n.*/m);
                var tempstr = data.toString().replace(re, "$1");
                return Promise.resolve({
                    temp: Number(tempstr),
                });
            }
        }
        oneWireRead(address, type) {
            if (type === 'DS18B20') {
                return new Promise((resolve,reject) => {
                    if (address === '28-MOCK1') {
                        var w1Slave = path.join(__dirname,"..","test","28-MOCK1");
                    } else if (address === '28-MOCK2') {
                        var w1Slave = path.join(__dirname,"..","test","28-MOCK2");
                    } else {
                        var w1Slave = path.join(W1DIR, address, 'w1_slave');
                    }
                    fs.readFile(w1Slave, (err,data) => 
                        this.parseDS18B20(err,data).then(r=>resolve(r)).catch(e=>reject(e))
                    );
                });
            } else {
                return Promise.reject(new Error(`oneWireRead(${address}, unknown type:${type}`));
            }

        }

    } //// class RaspiFacade

    module.exports = exports.RaspiFacade = RaspiFacade;
})(typeof exports === "object" ? exports : (exports = {}));
