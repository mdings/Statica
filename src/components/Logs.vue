<<template>
    <section id="logs">
        <Log v-for="log in logs" :log="log"></Log>
    </section>
</template>

<script>

const {ipcRenderer} = require('electron')

import Log from './Log.vue'

export default {

    components: {

        Log
    },

    data() {

        return {

            logs: []
        }
    },

    created() {

        ipcRenderer.on('project-error', (e, data) => {

            this.logs.push(data)
            this.$root.$emit('logs-badge', this.logs.length)
        })
    }
}
</script>

<style lang="sass">

    #logs {

        margin-top: 15px;
        padding: 0 25px;
    }
</style>

