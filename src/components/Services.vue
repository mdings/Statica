<template>
    <div>
        <div class="exporters">
            <Service v-for="exporter in activeProject.exporters" :service="exporter" v-bind:class="{active: exporter == activeService}"></Service>
        </div>
        <button @click="addExporter">Add</button>
        <button @click="removeExporter" v-bind:disabled="!activeService">Remove</button>
        <button @click="editExporter" v-bind:disabled="!activeService">Edit</button>
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

                activeService: null,
                activeProject: {}
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

            ipcRenderer.on('update-projects', (e, id) => {

                store.getProjectById(id).then(project => {

                    console.log(project)
                    this.activeProject = project
                })
            })

            this.$root.$on('setActiveService', service => {

                this.activeService = service
            })
        },

        methods: {

            addExporter() {

                win.show()
            },

            removeExporter() {

            },

            editExporter() {

            },

            selectService() {

                console.log('ok')
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

    .active {

        background-color: blue;
    }
</style>