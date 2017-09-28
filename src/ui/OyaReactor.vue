<template>

<div>
    <rb-about v-if="about" :name="componentName">
        <p> OyaReactor status and configuration
        </p>
        <rb-about-item name="about" value="false" slot="prop">Show this descriptive text</rb-about-item>
        <rb-about-item name="service" value="test" slot="prop">RestBundle name</rb-about-item>
        <rb-about-item name="vesselIndex" value="0" slot="prop">
            bndex (0-based) of vessel for component</rb-about-item>
    </rb-about>

    <v-card hover>
        <v-toolbar class="green darken-3">
            <v-toolbar-title class="white--text">{{name}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-side-icon dark @click="clickMenu"></v-toolbar-side-icon>
        </v-toolbar> 
        <v-card-text class="text-xs-center">
            <div style="display:flex; flex-direction: row; justify-content:space-around; flex-wrap: wrap; cursor: default">
                <div style="display:flex; flex-direction: column; justify-content: center">
                    <div>
                        <img v-show="rbService.active && rbService.Pump1" 
                            src="/assets/mist-on.svg" height=200px/>
                        <img v-show="rbService.active && !rbService.Pump1" 
                            src="/assets/mist-off.svg" height=200px/>
                        <img v-show="!rbService.active" src="/assets/inactive.svg" height=200px/>
                    </div>
                    <div class="pl-2">
                        <v-switch label="Bioreactor is on" v-show="rbService.active"
                            value input-value="true"
                            color="green darken-3"
                            v-on:click.native.stop="clickActivate()"></v-switch>
                        <v-switch label="Bioreactor is off" v-show="!rbService.active"
                            v-on:click.native.stop="clickActivate()"></v-switch>
                    </div>
                </div>
                <div style="min-width: 20em">
                    <v-list v-show="vessel" subheader>
                        <v-subheader @click='actuatorToggle=!actuatorToggle'
                            style="cursor: pointer">
                            Actuators
                            <v-icon v-show="actuatorToggle">keyboard_arrow_up</v-icon>
                            <v-icon v-show="!actuatorToggle">keyboard_arrow_down</v-icon>
                        </v-subheader>
                        <v-list-tile v-for="actuator in actuators" key="actuator.name" 
                            @click="clickActuator(actuator)"
                            v-show="actuatorToggle"
                            >
                            <v-list-tile-action v-show='rbService[actuator.name]' >
                                <v-icon class='green--text text--darken-3'>pets</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-action v-show='!rbService[actuator.name]' >
                                <v-icon class='grey--text text--lighten-1'>not_interested</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content >
                                <v-list-tile-title>
                                    {{actuator.name}}
                                </v-list-tile-title>
                                <v-list-tile-sub-title class="oya-desc">
                                    {{actuator.desc}}
                                </v-list-tile-sub-title>
                            </v-list-tile-content >
                        </v-list-tile>
                    </v-list>
                    <v-list v-show="vessel" subheader>
                        <v-subheader @click='cycleToggle=!cycleToggle'
                            style="cursor:pointer"> 
                            Cycles 
                            <v-icon v-show="cycleToggle">keyboard_arrow_up</v-icon>
                            <v-icon v-show="!cycleToggle">keyboard_arrow_down</v-icon>
                        </v-subheader>
                        <v-list-tile 
                            v-show='cycleToggle || cycle===rbService.cycle'
                            v-for="cycle in cycles" key="cycle" @click="clickCycle(cycle)" >
                            <v-list-tile-action 
                                v-show='cycle===rbService.cycle && !rbService.active' >
                                <v-icon class='grey--text text--darken-2'
                                    large
                                    v-show="!rbService.active">
                                    timer_off
                                </v-icon>
                            </v-list-tile-action>
                            <v-list-tile-action 
                                v-show='cycle===rbService.cycle && rbService.active' >
                                <div class='caption' v-show="rbService.active">
                                    <v-progress-circular v-bind:value="cycleProgress" 
                                        v-bind:rotate="-90"
                                        v-show="cycle===rbService.cycle && rbService.Pump1"
                                        class="blue--text text--darken-1">
                                        {{rbService.countdown}}
                                    </v-progress-circular>
                                    <v-progress-circular v-bind:value="cycleProgress" 
                                        v-bind:rotate="-90"
                                        v-show="cycle===rbService.cycle && !rbService.Pump1"
                                        class="amber--text text--darken-3">
                                        {{rbService.countdown}}
                                    </v-progress-circular>
                                </div>
                            </v-list-tile-action>
                            <v-list-tile-action 
                                v-show='cycle!==rbService.nextCycle && cycle!==rbService.cycle' >
                                <v-icon class='pl-1 grey--text text--lighten-1'>timer</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-action 
                                v-show='rbService.nextCycle!==rbService.cycle && cycle===rbService.nextCycle' >
                                <v-icon class='green--text text--darken-3'>hourglass_full</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content >
                                <v-list-tile-title>
                                    {{cycleDef(cycle).name}}
                                </v-list-tile-title>
                                <v-list-tile-sub-title class="oya-desc">
                                    {{cycleDef(cycle).desc}}
                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </div>
            </div>
        </v-card-text>
        <v-system-bar v-if='httpErr' 
            v-tooltip:above='{html:`${httpErr.config.url} \u2794 HTTP${httpErr.response.status} ${httpErr.response.statusText}`}'
            class='error' dark>
            <span >{{httpErr.response.data.error || httpErr.response.statusText}}</span>
        </v-system-bar>
    </v-card>
    <rb-api-dialog :apiSvc="apiSvc" v-if="apiModelCopy && apiModelCopy.rbHash">
        <div slot="title">Bioreactor Settings</div>
        <v-expansion-panel >
            <v-expansion-panel-content>
                <div slot="header">Vessel</div>
                <v-card>
                    <v-card-text>
                        <v-text-field v-model='apiModelCopy.vessels[vesselIndex].name' 
                            label="Name" class="input-group--focused" />
                        <v-text-field v-model='apiModelCopy.vessels[vesselIndex].fanThreshold' 
                            :label="`Fan threshold (\u00b0${apiModelCopy.tempUnit})`" class="input-group--focused" />
                    </v-card-text>
                </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
                <div slot="header">Cycles</div>
                <v-card>
                    <v-card-text>
                        <rb-dialog-row :label="cycleCopy.name" v-for="cycleCopy in editCycles" key="name">
                            <v-text-field v-model='cycleCopy.cycle.desc'
                                label="Description" class="input-group--focused" />
                            <v-layout>
                            <v-flex xs3>
                                <v-text-field v-model='cycleCopy.cycle.on'
                                    label="On seconds" class="input-group--focused" />
                            </v-flex>
                            <v-flex xs3>
                                <v-text-field v-model='cycleCopy.cycle.off'
                                    label="Off seconds" class="input-group--focused" />
                            </v-flex>
                            </v-layout>
                        </rb-dialog-row>
                    </v-card-text>
                </v-card>
            </v-expansion-panel-content>
            <v-expansion-panel-content>
                <div slot="header">MCU Pin Map</div>
                <v-card>
                    <v-card-text>
                        <v-text-field v-for="name in pinNames" key="name"
                            type="number"
                            v-model="apiModelCopy.pinMap[name]"
                            required
                            :rules="posIntRules(apiModelCopy.pinMap[name])"
                            :label="name" class="input-group--focused" />
                    </v-card-text>
                </v-card>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </rb-api-dialog>

</div>

</template>
<script>

import Vue from 'vue';
import rbvue from "rest-bundle/index-vue";
const RbApiDialog = rbvue.components.RbApiDialog;
const RbDialogRow = rbvue.components.RbDialogRow;

export default {
    mixins: [ 
        rbvue.mixins.RbAboutMixin, 
        rbvue.mixins.RbApiMixin.createMixin("oya-conf"),
    ],
    props: {
        vesselIndex: {
            default: 0,
        },
    },
    data: function() {
        return {
            apiEditDialog: false,
            activeToggle: false,
            actuatorToggle: false,
            cycleToggle: false,
            activeItems: [{
                text: "Stop",
                value: false,
            },{
                text: "Run",
                value: true,
            }],
        }
    },
    methods: {
        posIntRules(value) {
            return [
                () => !!value || 'This field is required',
                () => !!value && (Math.trunc(Number(value))+"") === (value+"") || 'Expected integer',
                () => !!value && Number(value) >= 0 || 'Expected positive number',
            ];
        },
        cycleDef(cycle) {
            var vessel = this.vessel;
            var cycle = cycle || this.rbService && this.rbService.cycle;
            return vessel && cycle && vessel.cycles[cycle];
        },
        clickMenu() {
            this.apiEdit();
        },
        clickActivate() {
            var url = [this.restOrigin(), this.service, 'reactor'].join('/');
            console.log("activate");
            this.$http.post(url, {
                activate:!this.rbService.active,
            }).then(r => {
                console.log("ok", r);
                this.activeToggle = r.data.activate;
            }).catch(e => {
                console.error("error", e);
                this.activeToggle = r.data.activate;
            });
        },
        clickActuator(actuator) {
            var url = [this.restOrigin(), this.service, 'actuator'].join('/');
            console.log("clicked", actuator);
            this.$http.post(url, {
                name: actuator.name,
                value: !this.rbService[actuator.name],
            }).then(r => {
                console.log("ok", r);
            }).catch(e => {
                console.error("error", e);
            });
        },
        clickCycle(cycle) {
            var url = [this.restOrigin(), this.service, 'vessel'].join('/');
            console.log("clicked", cycle);
            this.$http.post(url, {
                cycle,
            }).then(r => {
                console.log("ok", r);
                this.rbService.cycle = r.data.cycle;
            }).catch(e => {
                console.error("error", e);
            });
        },
    },
    computed: {
        pinNames() {
            var pinMap = this.apiModel && this.apiModel.pinMap;
            if (pinMap == null) {
                return [];
            }
            return Object.keys(pinMap).sort();
        },
        cycleProgress() {
            var countstart = this.rbService.countstart;
            var countdown = this.rbService.countdown;
            return countstart ? (countstart - countdown) * 100 / countstart : 100;
        },
        vessel() {
            var vessels = this.apiModel && this.apiModel.vessels;
            return vessels && vessels[this.vesselIndex];
        },
        actuators( ){
            return this.apiModel && this.apiModel.actuators.filter(a => 
                a.vesselIndex === this.vesselIndex);
        },
        name() {
            return this.vessel && this.vessel.name;
        },
        httpErr() {
            return this.rbResource.httpErr;
        },
        cycles() {
            var vessel = this.vessel;
            if (vessel  == null) {
                return [];
            }
            return Object.keys(this.vessel.cycles).sort();
        },
        editCycles() {
            var cycleNames = Object.keys(this.vessel.cycles).sort();
            var vessel = this.apiModelCopy.vessels[this.vesselIndex];
            return cycleNames.map(name => {
                return {
                    name: name,
                    cycle: vessel.cycles[name],
                }
            });
        },
    },
    components: {
        RbApiDialog,
        RbDialogRow,
    },
    created() {
        this.restBundleResource();
        this.rbDispatch("apiLoad").then(r => {
            console.log("OyaReactor apiLoad", r);
        });
        this.rbInitialized().then(r => {
            this.rbService.active != null && (this.activeToggle = this.rbService.active);
        }).catch(e => {
            console.error(e);
        });
    },
    mounted() {
    },
}

</script>
<style> 
.oya-desc {
    font-style: italic;
    font-size: xx-small;
}
.oya-desc:hover {
}
</style>
