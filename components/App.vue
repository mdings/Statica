<template>
    <main>
        <Project v-for="project in projects" :project="project"></Project>
        <button @click="addProject">Add</button>
        <button @click="clearStorage">Clear</button>
    </main>
</template>

<script>

    import Project from './Project.vue'

    const {ipcRenderer} = require('electron')
    const {dialog} = require('electron').remote
    const storage = require('electron-json-storage')

    export default {

        components: {

            Project
        },

        created() {

            storage.get('projects', (e, result) => {

                if (e) throw e

                if (result.length) {

                    this.projects = result
                }
            })

            this.$watch('projects', (newVal, oldVal) => {

                // note: newVal == oldVal when mutating array!

            })

            ipcRenderer.on('notify', (e, message) => {

                let myNotification = new Notification('Title', {

                    body: message
                })
            })
        },

        data() {

            return {

                projects: []
            }
        },

        methods: {

            clearStorage() {

                storage.clear((e) => {

                    if (e) throw e

                    this.projects = []
                })
            },


            addProject() {

                dialog.showOpenDialog({

                    properties: ['openDirectory']

                }, (filePaths) => {

                    const project = {

                        id: require('shortid').generate(),
                        name: filePaths[0],
                        path: filePaths[0],
                        isRunning: false
                    }

                    ipcRenderer.send('create-project', project)

                    this.projects.push(project)

                    storage.set('projects', this.projects, (e) => {

                        if (e) throw e
                    })
                })
            }
        }
    }

</script>

<style lang="sass">

    *,
    *:before,
    *:after {

        margin: 0;
        padding: 0;
        outline: none;
    }

</style>