(typeof describe === 'function') && describe("oyapi", function() {
	const should = require('should');
	const winston = require("winston");
	const OyaPi = require("../index").OyaPi;
	const OyaVessel = require("../index").OyaVessel;
    const Cassandra = require("cassandra-driver");
    const cql = new Cassandra.Client({ contactPoints:['127.0.0.1'], keyspace: 'oyamist' });

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

    it("cql_sensor_insert(ts, evt, value) returns cql insert statement", function() {
        var ts = new Date(2017,2,9,12,34,56);
        var stmt = OyaPi.cql_sensor_insert('oyamist01', ts, OyaVessel.SENSE_TEMP_INTERNAL, 12.34);
        stmt.should.equal("insert into sensor(vessel,evt,d,t,v) values(" +
            "'oyamist01','sense: temp-internal','2017-03-09','12:34:56',12.34);");
    });
	it("cql", function(done) {
        const query = 'SELECT * FROM sensor ';
        console.log("cql", query);
        cql.execute(query)
            .then(r => {
                console.log('cql ok:', r.first());
                done();
            }).catch(e=>{
                console.log('cql err:', e.stack);
                done(e)
            });
    });
});
