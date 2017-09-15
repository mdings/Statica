<template>
    <div id="inputs">

        <div v-if="action == 'add'">
            <label>Choose a service</label>
            <select @change="changeExporter" v-model="exporter">
                <option value="FTP">FTP</option>
                <option value="GithubPages">Github pages</option>
            </select>
            <!-- dynamic component -->
            <component :is="exporter" :ref="exporter"></component>
            <button class="confirm" @click="confirm" :disabled="disabled">Add service</button>
        </div>

        <div v-if="action == 'edit'">
            <!-- dynamic component -->
            <component :is="activeService.type" :service="activeService" :ref="exporter"></component>
            <button class="confirm" @click="confirm" :disabled="disabled">Update service</button>
        </div>

    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')
    const ftp = require('ftp-deploy')
    const remote = require('electron').remote

    import FTP from './services/FTP.vue'
    import GithubPages from './services/GithubPages.vue'

    export default {

        components: {
            FTP,
            GithubPages
        },

        props: ['action'],

        data() {

            return {

                exporter: 'FTP',
                disabled: true
            }
        },

        created() {

            this.$root.$on('set-button', isDisabled => {

                this.disabled = isDisabled
            })

            this.$root.$on('emitFormData', data => {

                this[this.action].call(this, data)
            })
        },

        computed: {

            activeService() {

                return this.$store.getters.activeService
            },

            services() {

                return this.$store.getters.services
            }
        },

        methods: {

            changeExporter(e) {

                this.exporter = e.target.value
                this.disabled = true
            },

            add(data) {

                console.log(data)

                const id = require('shortid').generate()

                let exporter = {

                    type: this.exporter,
                    id: id
                }

                // Store password fields safely with keytar
                if (data.password) {

                    ipcRenderer.send('storePassword', {

                        // projectId: this.project,
                        serviceId: id,
                        password: data.password
                    })

                    // remove the password field from the obj
                    delete data.password
                }

                Object.assign(exporter, data)
                this.$store.dispatch('addService', exporter)
            },

            edit(data) {

                // Store password fields safely with keytar
                if (data.password) {

                    ipcRenderer.send('storePassword', {

                        // projectId: this.project,
                        serviceId: data.id,
                        password: data.password
                    })

                    // remove the password field from the obj
                    delete data.password
                }

                this.$store.dispatch('editService', data)
            },

            confirm() {

                this.$root.$emit('closePanel')
                this.$root.$emit('getFormData')
            }
        }
    }
</script>