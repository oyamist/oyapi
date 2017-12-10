<template>

<v-app id="dev-app" >
   <v-navigation-drawer persistent light v-model="drawer" enable-resize-watcher app>
      <v-list dense>
        <div v-for="(item,i) in sidebarMain" :key="i">
          <v-list-tile exact :to="item.href">
            <v-list-tile-action>
                <v-icon >{{item.icon}}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <v-icon v-show='$route.path === item.href'>keyboard_arrow_right</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </div>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed flat class="black" app >
        <v-toolbar-side-icon dark @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title class="grey--text text--lighten-1">
            <div style="display:flex; flex-flow:column; ">
                <span class="mr-2" >{{package.name}} {{package.version}}</span>
                <span class="caption">OyaMist&trade; Bioreactor Console for Raspberry Pi</span>
            </div>
        </v-toolbar-title>
        <v-spacer/>
        <rb-web-socket/>
    </v-toolbar>
    <v-content>
        <v-container fluid > <router-view/> </v-container>
    </v-content>
</v-app>

</template> 
<script>

import Home from './Home.vue';
import rbvue from "rest-bundle/index-vue";
import oyavue from "oya-vue/index-vue";
//import appvue from "../../index-vue";

export default {
    name: 'dev',
    data() {
        return {
            package: require("../../package.json"),
            drawer: false,
            sidebarMain: [{
                icon: "question_answer",
                title: "Home",
                href: "/home",
            }],
            sidebarRestBundle: rbvue.methods.aboutSidebar(rbvue.components),
        }
    },
    methods: {
        productionUrl(path) {
            var host = location.port === "4000" 
                ? location.hostname + ":8080"
                : location.host;
            return "http://" + host + path;
        },
    },
    components: {
        Home,
    },
}

</script>
<style> </style>
