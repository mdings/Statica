<template>
    <section class="body" @click="resetActiveService">
        <div class="service">
            <span>Title</span>
            <span>Provider</span>
        </div>
        <Service
            v-for="service in services"
            v-bind:key="service.id"
            :service="service"
            :class="{'active': service == activeService}">
        </Service>
        <Activitybar></Activitybar>
    </section>
</template>

<script>

    const exporters = require('../../utils/exporters')
    const {ipcRenderer} = require('electron')

    import Activitybar from './Activitybar.vue'
    import Service from './Service.vue'
    import Inputs from './Inputs.vue'

    let timeout

    export default {

        components: {

            Activitybar,
            Service,
            Inputs
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

                    this.$store.dispatch('setActiveProject', project)
                }
            })

            ipcRenderer.on('doneOptimizeProject', (e, project) => {

                console.log('start deploying', project)
                const password = ipcRenderer.sendSync('retrievePassword', this.activeService.id)

                // Run the exporter when done optimizing. Also check the active project is still the same compared with the optimized one
                if (project.id == this.activeProject.id) {

                    const type = this.activeService.type
                    exporters[type](this.activeProject, this.activeService, password, this)
                }
            })
        },

        methods: {

            resetActiveService(e) {

                if (e.path[0].classList.contains('body')) {

                    this.$store.dispatch('resetActiveService')
                }
            }
        }
    }
</script>

<style lang="scss" scoped>

    @import "../../sass/components/service";

    .service {

        @extend %service;
    }
</style>
