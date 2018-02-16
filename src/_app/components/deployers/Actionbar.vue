<template>
    <div class="actions" :class="{'visible': isActionsOpen === true}">
        <button @click="removeExporter" v-bind:disabled="!activeService">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
                <line x1="13.79" x2="114.21" y1="64" y2="64" fill="none" stroke-width="12" stroke-miterlimit="10"/>
            </svg>
        </button>
        <button @click="editExporter" v-bind:disabled="!activeService">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="none"/><path d="M30,17.999V14h-4.201c-0.25-1.227-0.729-2.368-1.383-3.386l2.998-2.999l-2.83-2.828l-2.953,2.952 C20.553,7.002,19.324,6.47,18,6.201V2h-4v4.201c-1.277,0.26-2.463,0.765-3.512,1.459L7.614,4.787L4.785,7.614l2.874,2.876 C6.965,11.539,6.46,12.724,6.201,14H2v4h4.202c0.269,1.324,0.801,2.553,1.538,3.631l-2.954,2.953l2.83,2.83l2.998-2.999 c1.019,0.654,2.16,1.134,3.387,1.384V30h3.999v-4.201c1.276-0.26,2.463-0.764,3.512-1.459l3.073,3.074l2.83-2.83l-3.074-3.073 c0.694-1.05,1.199-2.235,1.458-3.512H30z M16,21.999c-3.313-0.006-5.994-2.688-6.001-5.999c0.008-3.313,2.688-5.994,6.001-6 c3.312,0.006,5.993,2.686,5.999,6C21.993,19.312,19.312,21.993,16,21.999z"/></svg>
        </button>
        <button @click="useExporter" v-bind:disabled="!activeService">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><path d="M58.385,34.343V21.615L53.77,26.23C50.244,22.694,45.377,20.5,40,20.5c-10.752,0-19.5,8.748-19.5,19.5S29.248,59.5,40,59.5 c7.205,0,13.496-3.939,16.871-9.767l-4.326-2.496C50.035,51.571,45.358,54.5,40,54.5c-7.995,0-14.5-6.505-14.5-14.5 S32.005,25.5,40,25.5c3.998,0,7.617,1.632,10.239,4.261l-4.583,4.583H58.385z"/></svg>
        </button>
    </div>
</template>
<script>

    const {ipcRenderer} = require('electron')

    export default {

        data() {

            return {

                isActionsOpen: false
            }
        },

        computed: {

            activeProject() {

                return this.$store.getters.activeProject
            },

            activeService() {

                return this.$store.getters.activeService
            }
        },

        methods: {

            removeExporter() {

                this.$store.dispatch('removeService', this.activeService)
            },


            editExporter(action) {

                this.$store.dispatch('showForm', 'edit')
            },

            useExporter() {

                // Dispatch event to optimize project
                ipcRenderer.send('optimizeProject', this.activeProject.id)
                this.$root.$emit('activityLogger', 'Optimizing files, hold on..')
            }
        }
    }
</script>

<style lang="scss">
    @import "../../sass/components/actions";
</style>
