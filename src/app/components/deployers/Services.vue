<template>
    <div id="exporters">
        <header>
            <span class="title">Deploy to..</span>
            <button @click="doAction('add')">
                <svg :class="{'visible': isFormOpen}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/></svg>
            </button>
        </header>
        <div class="body">
            <div class="exporters">
                <div>
                    <span>Title</span>
                    <span>Provider</span>
                </div>
                <Service v-for="service in services" v-bind:key="service.id" :service="service" :class="{'active': service == activeService}"></Service>
            </div>
            <div class="activity" :class="{'visible': isActivityOpen}">
                <span class="message">{{log}}</span>
                <span class="loader"></span>
            </div>
        </div>

        <div class="actions" :class="{'visible': isActionsOpen === true}">
            <button @click="removeExporter" v-bind:disabled="!activeService">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                    <line x1="13.79" x2="114.21" y1="64" y2="64" fill="none" stroke-width="12" stroke-miterlimit="10"/>
                </svg>
            </button>
            <button @click="doAction('edit')" v-bind:disabled="!activeService">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="none"/><path d="M30,17.999V14h-4.201c-0.25-1.227-0.729-2.368-1.383-3.386l2.998-2.999l-2.83-2.828l-2.953,2.952 C20.553,7.002,19.324,6.47,18,6.201V2h-4v4.201c-1.277,0.26-2.463,0.765-3.512,1.459L7.614,4.787L4.785,7.614l2.874,2.876 C6.965,11.539,6.46,12.724,6.201,14H2v4h4.202c0.269,1.324,0.801,2.553,1.538,3.631l-2.954,2.953l2.83,2.83l2.998-2.999 c1.019,0.654,2.16,1.134,3.387,1.384V30h3.999v-4.201c1.276-0.26,2.463-0.764,3.512-1.459l3.073,3.074l2.83-2.83l-3.074-3.073 c0.694-1.05,1.199-2.235,1.458-3.512H30z M16,21.999c-3.313-0.006-5.994-2.688-6.001-5.999c0.008-3.313,2.688-5.994,6.001-6 c3.312,0.006,5.993,2.686,5.999,6C21.993,19.312,19.312,21.993,16,21.999z"/></svg>
            </button>
            <button @click="useExporter" v-bind:disabled="!activeService">



<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M58.385,34.343V21.615L53.77,26.23C50.244,22.694,45.377,20.5,40,20.5c-10.752,0-19.5,8.748-19.5,19.5S29.248,59.5,40,59.5 c7.205,0,13.496-3.939,16.871-9.767l-4.326-2.496C50.035,51.571,45.358,54.5,40,54.5c-7.995,0-14.5-6.505-14.5-14.5 S32.005,25.5,40,25.5c3.998,0,7.617,1.632,10.239,4.261l-4.583,4.583H58.385z"/></svg>
            </button>
        </div>

        <div class="form" :class="{'visible': isFormOpen}" data-form>
            <Inputs :action="action"></Inputs>
        </div>
    </div>
</template>

<script>

    const exporters = require('../../utils/exporters')
    const remote = require('electron').remote
    const {ipcRenderer} = require('electron')

    import '../../sass/main.scss'
    import Titlebar from '../shared/Titlebar.vue'
    import Service from './Service.vue'
    import Inputs from './Inputs.vue'

    let timeout

    export default {

        components: {

            Titlebar,
            Service,
            Inputs
        },

        watch: {

            activeService() {

                if (this.activeService) {

                    this.isActionsOpen = true
                }
            }
        },

        data() {

            return {

                log: '',
                isActivityOpen: false,
                isActionsOpen: false,
                isFormOpen: false,
                action: null
            }
        },

        computed: {

            activeProject() {

                return this.$store.getters.activeProject
            },

            activeService() {

                return this.$store.getters.activeService
            },

            services() {

                return this.$store.getters.services
            }
        },


        created() {

            ipcRenderer.on('setActiveProject', (e, project) => {

                if (project.id != this.activeProject.id) {

                    this.isActionsOpen = false
                    this.isFormOpen = false
                    this.$store.dispatch('setActiveProject', project)
                }
            })

            ipcRenderer.on('done-optimize-project', (e, project) => {

                console.log('start deploying', project)
                const password = ipcRenderer.sendSync('retrievePassword', this.activeService.id)

                // Run the exporter when done optimizing. Also check the active project is still the same compared with the optimized one
                if (project.id == this.activeProject.id) {

                    const type = this.activeService.type
                    exporters[type](this.activeProject, this.activeService, password, this)
                }
            })

            this.$root.$on('hideActivityLogger', () => {

                this.isActivityOpen = false
            })

            this.$root.$on('closePanel', () => {

                this.doAction('edit')
            })

            this.$root.$on('activityLogger', msg => {

                if(!this.isActivityOpen) {

                    this.isActivityOpen = true
                }

                this.log = msg
            })
        },

        mounted() {

            // If the active project is not set by the time we have mounted the object, close the window
            const obj = this.$store.getters.activeProject
            if(Object.keys(obj).length === 0
                && obj.constructor === Object) {

                remote.getCurrentWindow().hide()
            }
        },

        methods: {

            doAction(action) {

                if (this.isFormOpen) {

                    const form = this.$el.querySelector('[data-form]')
                    const removeAction = () => {

                        this.action = null
                        form.removeEventListener('transitionend', removeAction)
                    }

                    this.isFormOpen = false
                    form.addEventListener('transitionend', removeAction)

                } else {

                    this.isFormOpen = true
                    this.action = action
                }

            },

            removeExporter() {

                this.isActionsOpen = false
                this.$store.dispatch('removeService', this.activeService)
            },

            useExporter() {

                console.log('using exporter!')
                // Dispatch event to optimize project
                ipcRenderer.send('optimize-project', this.activeProject.id)
                if(!this.isActivityOpen) {

                    this.isActivityOpen = true
                }

                this.log = 'Optimizing files, hold on..'
            }
        }
    }
</script>

<style lang="sass" scoped>
.activity {

    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    padding: 7px 12px;
    background-color: #157EFB;
    font-size: 12px;
    color: #fff;
    z-index: -1;
    transform: translateY(100%);
    transition: transform 350ms cubic-bezier(0.77, 0, 0.175, 1);

    &.visible {

        transform: translateY(0);
    }
}

.loader {
    display: block;
    position: relative;
    width: 15px;
    height: 15px;
    opacity: 1;
    transform-origin: 50% 50%;
    transition: all 100ms ease-in;

    &:before {

        animation: spin 500ms linear infinite;
        border-radius: 50%;
        border: 1px solid transparent;
        border-top-color: #fff;
        display: block;
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
    }
}
</style>
