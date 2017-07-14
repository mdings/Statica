<template>
    <div id="exporters">
        <header>
            <TrafficLights></TrafficLights>
            <span class="title">Deploy to..</span>
        </header>
        <div class="body">
            <div class="exporters">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Provider</th>
                        </tr>
                    </thead>
                    <tbody>
                        <Service v-for="service in services" v-bind:key="service.id" :service="service" :class="{'active': service == activeService}"></Service>
                    </tbody>
                </table>

            </div>
            <div class="form" :class="{'visible': isAdding}">
                <Inputs :project="activeProject"></Inputs>
            </div>
        </div>
        <div class="actions">
            <button @click="addExporter">+</button>
            <button @click="removeExporter" v-bind:disabled="!activeService">-</button>
            <button @click="editExporter" v-bind:disabled="!activeService">...</button>
            <button @click="useExporter" v-bind:disabled="!activeService">^</button>
        </div>
        <div class="progress" :class="{'is-active': isExporting}"></div>
    </div>
</template>

<script>

    const store = require('../store')
    const exporters = require('../utils/exporters')
    const {ipcRenderer} = require('electron')
    const {BrowserWindow} = require('electron').remote
    let win

    import '../sass/main.scss'
    import TrafficLights from './TrafficLights.vue'
    import Titlebar from './Titlebar.vue'
    import Service from './Service.vue'
    import Inputs from './Inputs.vue'

    export default {

        components: {

            TrafficLights,
            Titlebar,
            Service,
            Inputs
        },

        data() {

            return {

                services: [],
                html: '',
                isAdding: false,
                isExporting: false,
                activeProject: null,
                activeService: null,
            }
        },

        mounted() {

        },

        created() {

            this.html = document.getElementById('titlebar')

            ipcRenderer.on('emptyServices', () => {

                this.services = []
            })

            ipcRenderer.on('setActiveProject', (e, project) => {

                // Re-retrieve the project from storage
                store.getProjectById(project.id).then(project => {

                    this.activeProject = project
                    this.activeService = project.services[0]
                    this.services = project.services
                })

            })

            ipcRenderer.on('retrievePassword', (e, pass) => {

                // This is when we get the signal back from the main project with the password/
                // So we can go ahead and use the service to deploy against
                const type = this.activeService.type
                exporters[type](this.activeProject, this.activeService, pass)
            })

            ipcRenderer.on('reloadActiveProject', e => {

                // Re-retrieve the project from storage because updates have been made in a different window
                store.getProjectById(this.activeProject.id).then(project => {

                    console.log(project)
                    this.services = project.services
                })
            })

            this.$root.$on('setActiveService', service => {

                this.activeService = service
            })

            this.$root.$on('closeProjectPanel', e => {

                this.isAdding = false
            })
        },

        methods: {

            addExporter() {

                this.isAdding = !this.isAdding
            },

            removeExporter() {

                const services = this.services.filter(service => {

                    return service != this.activeService
                })

                this.activeService = null
                this.activeProject.services = services
                this.services = services
                store.setProjectById(this.activeProject)
            },

            editExporter() {

                this.isExporting = !this.isExporting
            },

            useExporter() {

                console.log('using exporter')
                console.log(this.activeService)
                // Send a signal to the main process to safely retrieve the password from Keytar
                ipcRenderer.send('retrievePassword', {

                    serviceId: this.activeService.id
                })
            },

            selectService() {

                console.log('ok')
            }
        }
    }
</script>