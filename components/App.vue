<template>
    <main @dragover="showDropArea">
        <Project v-for="project in projects" :project="project"></Project>
        <button @click="openDialog">Add</button>
        <button @click="clearStorage">Clear</button>
    </main>
</template>

<script>

    import Project from './Project.vue'

    const fs = require('fs')
    const {ipcRenderer} = require('electron')
    const {dialog} = require('electron').remote
    const storage = require('electron-json-storage')

    export default {

        components: {

            Project
        },

        created() {

            document.body.ondrop = (e) => {

                this.addProject(e.dataTransfer.files[0].path)
                e.preventDefault()
            }

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

            showDropArea(e) {

                console.log('ok dropping')
                e.preventDefault()
            },

            addProject(folder) {

                // check if the added path is actually a directory
                // @TODO: fail gracefully
                if (fs.lstatSync(folder).isDirectory()) {
                    
                    const project = {

                        id: require('shortid').generate(),
                        name: folder,
                        path: folder,
                        isRunning: false
                    }

                    this.projects.push(project)

                    ipcRenderer.send('create-project', project)

                    //@TODO: move this to the background window
                    storage.set('projects', this.projects, (e) => {

                        if (e) throw e
                    })
                }
            },

            openDialog() {

                dialog.showOpenDialog({

                    properties: ['openDirectory']

                }, (filePaths) => {

                    this.addProject(filePaths[0])
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
        box-sizing: border-box;
    }

    main {

        min-height: 100vh;
    }

</style>