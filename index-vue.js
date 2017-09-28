import OyaVue from "oya-vue";
const OyaReactor = OyaVue.OyaReactor;

var components = {
    OyaReactor,
}
function plugin(Vue, options) {
    Object.keys(components).forEach( key => Vue.component(key, components[key]));
}

export default {
    install: plugin,
    components,
}
