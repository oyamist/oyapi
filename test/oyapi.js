(typeof describe === 'function') && describe("oyapi", function() {
	const should = require('should');
	const winston = require("winston");
	const OyaPi = require("../index").OyaPi;
	const OyaVessel = require("../index").OyaVessel;
    const SQLite3 = require('sqlite3').verbose();
    const testDate = new Date(2017,2,9,12,34,56);
    const TESTDATESTR = "'2017-03-09'";

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
        var stmt = OyaPi.sql_sensor_insert('test', testDate, OyaVessel.SENSE_TEMP_INTERNAL, 12.34);
        stmt.should.equal("insert into sensordata(vessel,evt,d,t,v) values(" +
            `'test','sense: temp-internal',${TESTDATESTR},'12:34:56',12.34);`);
    });
    it("sqlite3 uses oyamist.db", function(done) {
        var async = function*() {
            try {
                var countStmt = `select count(*) c from sensordata as sd where sd.d=${TESTDATESTR}`;
                var stmtDel = `delete from sensordata where sensordata.vessel='test'`;
                var db = new SQLite3.Database('./oyamist.db', SQLite3.OPEN_READWRITE);
                db.on('error', e=> async.throw(e));
                yield db.on('open', ()=>async.next(true));

                // delete any pre-existing test data from failed tests
                yield db.run(stmtDel, [], e=> e?async.throw(e):async.next(true));
                var n = yield db.get(countStmt, [], (e,r)=>e?async.throw(e):async.next(r.c)); 
                n.should.equal(0);

                // add sensor data row
                var stmt = OyaPi.sql_sensor_insert('test', testDate, OyaVessel.SENSE_TEMP_INTERNAL, 12.34);
                yield db.run(stmt, [], e=> e?async.throw(e):async.next(true));
                var n = yield db.get(countStmt, [], (e,r)=>e?async.throw(e):async.next(r.c)); 
                n.should.equal(1);

                // remove sensor data row
                yield db.run(stmtDel, [], e=> e?async.throw(e):async.next(true));
                var n = yield db.get(countStmt, [], (e,r)=>e?async.throw(e):async.next(r.c)); 
                n.should.equal(0);

                db.close(); 
                done();
            } catch(e) {
                winston.error("failed", e.stack);
                done(e);
            }
        }();
        async.next();
    });
});
