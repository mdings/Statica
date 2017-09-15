import Vue from 'vue'
import App from './components/projects/App.vue'
import Services from './components/deployers/Services.vue'
import store from './vuex/store'

// Bootstrap both windows from the same file
if (document.querySelector('#app__projects')) {

    const projects = new Vue({

        store,
        el: '#app__projects',
        components: {
            App
        }
    })
}

if (document.querySelector('#app__services')) {
    const services = new Vue({

        store,
        el: '#app__services',
        components: {
            Services
        }
    })
}