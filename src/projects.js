import Vue from 'vue'
import App from './components/App.vue'
import store from './vuex/store'

const app = new Vue({

    store,
    el: '#app',
    components: {

        App
    }
})

