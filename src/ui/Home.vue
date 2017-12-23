<template>

    <v-expansion-panel>
        <v-expansion-panel-content >
            <div slot="header">Controls</div>
            <oya-reactor :service="service"></oya-reactor>
        </v-expansion-panel-content>
        <v-expansion-panel-content >
            <div slot="header">Charts</div>
            <oya-chart palette="red" sensorProp="tempInternal" :service="service"></oya-chart>
            <oya-chart palette="blue" sensorProp="humidityInternal" :service="service"></oya-chart>
        </v-expansion-panel-content>
        <v-expansion-panel-content >
            <div slot="header">Developer</div>
            <rb-state></rb-state>
        </v-expansion-panel-content>
    </v-expansion-panel>

</template><script>

export default {
name: 'introduction',
props: {
    service: {
        default: "oyapi",
    },
},
}

</script><style>

</style>
