(typeof describe === 'function') && describe("oyapi", function() {
	const should = require('should');
	const winston = require("winston");
	const {
        OyaPi,
        OyaMist,
        OyaVessel,
        Sensor,
        SystemFacade,
    } = require("oya-vue");
	const RaspiFacade = require("../index").RaspiFacade;
    const EventEmitter = require('events');
    const SQLite3 = require('sqlite3').verbose();
    const testDate = new Date(2017,2,9,12,34,56);
    const TESTDATESTR = "'2017-03-09'";

    winston.level = 'warn';

    SystemFacade.facade = new RaspiFacade();

    const rpio = require('rpio');
    if (!rpio.hasOwnProperty('isMock')) {
        rpio.isMock = false;
        rpio.on('warn', (msg) => {
            console.log("WARNING", msg);
            rpio.isMock = true;
        });
        rpio.init();
    }
    it("TESTTESTRaspiFacade reads and parses 1-wire", function(done) {
        (async function() {
            try {
                var facade = new RaspiFacade();
                var r = await facade.oneWireRead('28-MOCK1',Sensor.TYPE_DS18B20.type);
                r.temp.should.equal(17812);
                var r = await facade.oneWireRead('28-MOCK1',Sensor.TYPE_DS18B20.type);
                r.temp.should.equal(17812);
                var r = await facade.oneWireRead('28-MOCK2',Sensor.TYPE_DS18B20.type);
                r.temp.should.equal(20125);
                SystemFacade.facade = facade;
                var temp = "(no-value)";
                var emitter = new EventEmitter();
                emitter.on(OyaMist.SENSE_TEMP_INTERNAL, v=>{
                    temp = v;
                });
                var sensor = new Sensor({
                    type: Sensor.TYPE_DS18B20.type,
                    loc: OyaMist.LOC_INTERNAL,
                    address: "28-MOCK1",
                    emitter,
                });
                should(sensor.loc).equal("internal");
                var r = await sensor.read();
                should(r).properties({
                    temp: 17.812,
                });
                should(temp).equal(17.812);
                done();
            } catch(e) {
                done(e);
            }
        })();
    });
    it("sqlite3 uses oyamist-v1.0.db", function(done) {
        var async = function*() {
            try {
                var countStmt = `select count(*) c from sensordata as sd where evt='testevt'`;
                var stmtDel = `delete from sensordata where sensordata.ctx='test'`;
                var db = new SQLite3.Database('./oyamist-v1.0.db', SQLite3.OPEN_READWRITE);
                db.on('error', e=> async.throw(e));
                yield db.on('open', ()=>async.next(true));

                // delete any pre-existing test data from failed tests
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
