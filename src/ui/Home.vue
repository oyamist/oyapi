<template>

    <v-expansion-panel>
        <v-expansion-panel-content >
            <div slot="header">Controls</div>
            <oya-reactor :service="service"></oya-reactor>
        </v-expansion-panel-content>
        <v-expansion-panel-content >
            <div slot="header">Charts</div>
            <oya-chart-panel service='oyamist'/>
        </v-expansion-panel-content>
        <v-expansion-panel-content >
            <div slot="header">Network</div>
            <oya-network :service="service"/>
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
        default: "oyamist",
    },
},
}

</script><style>

</style>
