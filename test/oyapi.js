(typeof describe === 'function') && describe("PmiAutomation", function() {
	const should = require('should');
	const winston = require("winston");
	const OyaPi = require("../index").OyaPi;
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

	it("turns on an led", function(done) {
        done();
    });
});
