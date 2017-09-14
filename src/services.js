import Vue from 'vue'
import store from './vuex/store'
import Services from './components/Services.vue'

new Vue({

    store,
    el: '#services',
    components: {

        Services
    }
})

