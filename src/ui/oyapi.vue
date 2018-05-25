<template>

<v-app id="oyapi-app" >
   <v-navigation-drawer temporary absolute light v-model="drawer" enable-resize-watcher app>
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
        <v-list-group v-model="showDeveloper">
            <v-list-tile slot="item">
              <v-list-tile-action> <v-icon >build</v-icon> </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Developer</v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon dark>keyboard_arrow_down</v-icon>
              </v-list-tile-action>
            </v-list-tile>
            <div v-for="(item,i) in sidebarDeveloper" :key="i">
              <v-list-tile exact :to="item.href">
                <v-list-tile-content>
                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                    <v-icon v-show='$route.path === item.href'>keyboard_arrow_right</v-icon>
                </v-list-tile-action>
              </v-list-tile>
            </div>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed flat class="black" app >
        <v-toolbar-side-icon dark @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title class="grey--text text--lighten-1">
            <div class="mr-2 app-title" >
                <div class="app-subtitle">OyaMist&trade; Microfarm Console for Raspberry Pi</div>
                {{package.name}} {{package.version}}
            </div>
        </v-toolbar-title>
        <v-spacer/>
        <rb-web-socket/>
    </v-toolbar>
    <v-content class='oya-content'>
        <v-container fluid style="padding-right:1em"> 
            <router-view></router-view> 
        </v-container>
    </v-content>
    <rb-alerts></rb-alerts>
</v-app>

</template> 
<script>

import Home from './Home.vue';
import rbvue from "rest-bundle/index-vue";
import oyavue from "oya-vue/index-vue";
//import appvue from "../../index-vue";
const {
    OyaDashboard,
    OyaDeveloper,
    OyaNetwork,
} = oyavue.components;

export default {
    name: 'oyapi',
    data() {
        return {
            package: require("../../package.json"),
            drawer: false,
            sidebarMain: [{
                icon: "question_answer",
                title: "Dashboard",
                href: "/dashboard",
            },{
                icon: "show_chart",
                title: "Charts",
                href: "/charts",
            },{
                icon: "network_check",
                title: "Network",
                href: "/network",
            }],
            sidebarRestBundle: rbvue.methods.aboutSidebar(rbvue.components),
            showDeveloper: false,
            sidebarDeveloper: [{
                icon: "build",
                title: "Client state",
                href: "/developer",
           }],
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
        OyaDashboard,
        OyaDeveloper,
        OyaNetwork,
    },
}

</script>
<style> 
.oya-content {
}
.app-title {
    position: relative;
    padding-bottom: 0.5em;
    width: 20em;
}
.app-subtitle {
    position: absolute;
    bottom: 0px;
    font-size: 10px;
}
</style>
