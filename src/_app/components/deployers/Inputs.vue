<template>
    <div class="slidepanel"
        :class="{'visible': isFormOpen}"
        data-form>

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
    const remote = require('electron').remote

    import FTP from './services/FTP.vue'
    import GithubPages from './services/GithubPages.vue'

    export default {

        components: {
            FTP,
            GithubPages
        },

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
            },

            isFormOpen() {

                return this.$store.getters.isFormOpen
            },

            action() {

                return this.$store.getters.action
            }
        },

        methods: {

            changeExporter(e) {

                this.exporter = e.target.value
                this.disabled = true
            },

            add(data) {

                const id = require('shortid').generate()

                let exporter = {

                    type: this.exporter,
                    id: id
                }

                Object.assign(exporter, data)
                this.$store.dispatch('addService', exporter)
            },

            edit(data) {

                this.$store.dispatch('editService', data)
            },

            confirm() {

                this.$store.dispatch('hideForm')
                this.$root.$emit('getFormData')
            }
        }
    }
</script>

<style lang="scss">
    @import "../../sass/components/slidepanel";
</style>
