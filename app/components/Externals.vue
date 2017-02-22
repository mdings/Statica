<template>
    <div>
        <div class="externals">
            <External v-for="external in externals"></External>
        </div>
        <button @click="addExternal">Add</button>
    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')
    import External from './External.vue'

    export default {

        components: {
            External
        },

        data() {

            return {

                externals: [],
                project: null
            }
        },

        created() {

            ipcRenderer.on('show-export-window', (e, project) => {

                this.project = project
            })

            ipcRenderer.on('update-project-externals', (e, options) => {

                this.externals.push(options)
                this.project.externals = this.externals

            })
        },

        methods: {

            addExternal() {

                ipcRenderer.send('show-add-export-window', this.project)
            }
        }
    }
</script>

<style lang="sass">
    .externals {

        border: 1px solid red;
        width: 400px;
        height: 200px;
    }
</style>