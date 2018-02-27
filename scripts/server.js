#!/usr/bin/env node

const path = require("path");
const compression = require('compression');
const express = require('express');
const app = module.exports = express();
const rb = require("rest-bundle");
const OyaPi = require("../src/oyapi");
const RaspiFacade = require("../src/raspi-facade");
var { VmcBundle } = require('vue-motion-cam');
const DbSqlite3 = require("oya-vue").DbSqlite3;
const SystemFacade = require("oya-vue").SystemFacade;
const winston = require("winston");
const EventEmitter = require('events');

global.__appdir = path.dirname(__dirname);

app.use(compression());
winston.info(`Launching OyaPi ${new Date()}`);

try {
    var rpio = require('rpio');
} catch (err) {
    var rpio = null;
    console.log("Could not load rpio. Hardware automation is disabled");
}

// ensure argv is actually for script instead of mocha
var argv = process.argv[1].match(__filename) && process.argv || [];
argv.filter(a => a==='--log-debug').length && (winston.level = 'debug');

// set up application
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Access-Control-Allow-Headers");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
    next();
});
app.use("/", express.static(path.join(__dirname, "../src/ui")));
app.use("/dist", express.static(path.join(__dirname, "../dist")));

app.locals.asyncOnReady = []; // list of async blocks waiting on app setup completion
let async = function*() { 
    try {
        // define RestBundles
        var restBundles = app.locals.restBundles = [];
        var dbfacade = new DbSqlite3({ 
            dbname: 'oyamist-v1.0.db',
            logPeriod: 60,
        });
        SystemFacade.facade = new RaspiFacade();
        var oyaEmitter = new EventEmitter();
        var oya = new OyaPi("oyamist", {
            dbfacade,
            emitter: oyaEmitter,
        });
        yieal oya.initialize().then(r=>async.next(r)).catch(e=>async.throw(e));
        restBundles.push(oya);
        var vmc = new VmcBundle("vmc", {
            emitter: oyaEmitter,
        });
        yieal vmc.initialize().then(r=>async.next(r)).catch(e=>async.throw(e));
        restBundles.push(vmc);

        // declare ports
        var isTesting = module.parent != null && false;
        var testports = new Array(100).fill(null).map((a,i) => 3000 + i); // lots of ports for mocha -w
        var ports = isTesting ? testports : [80,8080];

        // create http and socket servers
        var rbServer = app.locals.rbServer = new rb.RbServer();
        rbServer.listen(app, restBundles, ports);
        yieal rbServer.initialize().then(r=>async.next(r)).catch(e=>async.throw(e));

        winston.debug("firing asyncOnReady event");
        app.locals.asyncOnReady.forEach(async => async.next(app)); // notify waiting async blocks
    } catch (err) {
        winston.error("server.js:", err);
        async.throw(err);
    }
}();
async.next();
