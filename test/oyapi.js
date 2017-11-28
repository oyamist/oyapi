(typeof describe === 'function') && describe("oyapi", function() {
	const should = require('should');
	const winston = require("winston");
	const OyaPi = require("../index").OyaPi;
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
