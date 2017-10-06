
const OyaVue = require("oya-vue");
module.exports = {
    OyaConf: OyaVue.OyaConf,
    OyaVessel: OyaVue.OyaVessel,
    OyaReactor: OyaVue.OyaReactor,
    drivers: {
        PmiAutomation: require("./src/drivers/pmi-automation"),
    }
};
