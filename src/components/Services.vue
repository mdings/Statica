<template>
    <div id="exporters">
        <header>
            <TrafficLights></TrafficLights>
            <span class="title">Deploy to..</span>
        </header>
        <div class="body">
            <div class="exporters">
                <Service v-for="service in services" :service="service" :class="{'active': service == activeService}"></Service>
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
                exporters[type](this.activeProject, this.activeService)
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

<style lang="sass">

    @import "src/mixins/header";
    @import "src/mixins/reset";

    header {

        height: 25px;
        flex: 0 0 25px;

        span {

            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-size: 13px;
            color: #222;
        }
    }

    #exporters {

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100vh;
        overflow: hidden;
    }

    .body {

        flex: 1;
        position: relative;
        overflow: hidden;
    }

    .exporters {

        padding: 5px;
        user-select: none;
        cursor: default;
        height: 100%;
        overflow: scroll;

        & > div {
            font-size: 14px;
            border-radius: 3px;
            padding: 10px 20px;

            &.active {

                background-color: #BCDDF6;
            }
        }
    }

    .form {

        padding: 5px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
        transform: translateY(100%);
        background-color: #f5f5f5;
        transition: transform 100ms cubic-bezier(0.17, 0.67, .98, 1);

        &.visible {

            transform: translateY(0%);
        }
    }

    .actions {

        display: flex;
        justify-content: space-between;
        border-top: 1px solid #f1f1f1;
        background-color: #fff;

        & > * {

            border: none;
            background: transparent;
            outline: none;
            flex: 0 0 25%;
            height: 30px;
        }
    }

    .progress {

        max-height: 0px;
        height: 20px;
        overflow: hidden;
        background-color: #333;
        transition: max-height 100ms cubic-bezier(0.455, 0.030, 0.515, 0.955);

        &.is-active {

            max-height: 20px;
        }
    }
</style>