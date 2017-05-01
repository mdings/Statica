<template>
    <div>
        <div class="exporters">
            <Service v-for="exporter in activeProject.exporters" :service="exporter"></Service>
        </div>
        <button @click="addExporter">Add</button>
    </div>
</template>

<script>

    const store = require('../store')
    const {ipcRenderer} = require('electron')
    const {BrowserWindow} = require('electron').remote
    let win

    import Service from './Service.vue'

    export default {

        components: {
            Service
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

            win.on('hide', e => {

                // Reset the window
                e.sender.reload()
            })

            ipcRenderer.on('setActiveProject', (e, project) => {

                this.activeProject = project
                // and load the index.html of the app.
                if (process.env.NODE_ENV === 'development') {

                    win.loadURL(`http://localhost:8080/inputs.html?project=${project.id}`)

                } else {

                    win.loadURL(`file://${__dirname}/inputs.html?project=${project.id}`)
                }

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