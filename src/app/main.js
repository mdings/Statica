import Vue from 'vue'
import store from './vuex/store'

import App1 from './components/projects/App.vue'
import App2 from './components/deployers/App.vue'

// Bootstrap both windows from the same file
if (document.querySelector('#app__projects')) {

    const projects = new Vue({

        store,
        el: '#app__projects',
        components: {
            App1
        }
    })
}

if (document.querySelector('#app__services')) {

    const services = new Vue({

        store,
        el: '#app__services',
        components: {
            App2
        }
    })
}