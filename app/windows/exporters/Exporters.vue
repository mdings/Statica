<template>
    <div>
        <div class="exporters">
            <Exporter v-for="exporter in activeProject.exporters" :exporter="exporter"></Exporter>
        </div>
        <button @click="addExporter">Add</button>
    </div>
</template>

<script>

    const store = require('../../store')
    const {ipcRenderer} = require('electron')
    const {BrowserWindow} = require('electron').remote
    let win

    import Exporter from './Exporter.vue'

    export default {

        components: {
            Exporter
        },

        data() {

            return {

                activeProject: [],
            }
        },

        created() {

            // Create the small window to add exporter
            win = new BrowserWindow({
                width: 300,
                height: 400,
                show: false,
                modal: true,
                parent: require('electron').remote.getCurrentWindow()
            })


            win.on('hide', (e) => {

                // Reset the window
                e.sender.reload()
            })

            win.loadURL(`file://${__dirname}/add/index.html`)

            ipcRenderer.on('setActiveProject', (e, project) => {

                this.activeProject = project
            })

            ipcRenderer.on('updateProjectExporters', (e, options) => {

                store.setProjectById(this.activeProject)
                this.activeProject.exporters.push(options)
            })
        },

        methods: {

            addExporter() {

                win.show()
            }
        }
    }
</script>

<style lang="sass">

    .exporters {

        border: 1px solid red;
        width: 400px;
        height: 200px;
    }
</style>