
const OyaVue = require("oya-vue");
module.exports = {
    OyaConf: OyaVue.OyaConf,
    OyaVessel: OyaVue.OyaVessel,
    OyaReactor: OyaVue.OyaReactor,
    OyaPi: require("./src/oyapi"),
    RaspiFacade: require("./src/raspi-facade"),
    drivers: {
        PmiAutomation: require("./src/drivers/pmi-automation"),
    }
};
