(typeof describe === 'function') && describe("oyapi", function() {
	const should = require('should');
	const winston = require("winston");
	const OyaPi = require("../index").OyaPi;
	const OyaVessel = require("../index").OyaVessel;
    const SQLite3 = require('sqlite3');

    winston.level =  'debug';

    const rpio = require('rpio');
    if (!rpio.hasOwnProperty('isMock')) {
        rpio.isMock = false;
        rpio.on('warn', (msg) => {
            console.log("WARNING", msg);
            rpio.isMock = true;
        });
        rpio.init();
    }
    console.log("isMock", rpio.isMock);

    it("sql_sensor_insert(ts, evt, value) returns cql insert statement", function() {
        var ts = new Date(2017,2,9,12,34,56);
        var stmt = OyaPi.sql_sensor_insert('oyamist01', ts, OyaVessel.SENSE_TEMP_INTERNAL, 12.34);
        stmt.should.equal("insert into sensor(vessel,evt,d,t,v) values(" +
            "'oyamist01','sense: temp-internal','2017-03-09','12:34:56',12.34);");
    });
    it("sqlite3 uses oyamist.db", function(done) {
        try {
            var db = new SQLite3.Database('./oyamist.db', SQLite3.OPEN_READWRITE, e=>{
                e && done(e) ||
                    db.close(e=>(e && done(e) || done()));
            });
        } catch(e) {
            winston.error(e.stack);
            done(e);
        }
    });
});
