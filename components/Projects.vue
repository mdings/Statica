<template>
    <div id="projects">
        <Project v-for="project in projects" :project="project"></Project>
    </div>
</template>

<script>

    import Project from './Project.vue'

    const fs = require('fs')
    const {dialog} = require('electron').remote
    const {ipcRenderer} = require('electron')
    const storage = require('electron-json-storage')

    export default {

        created() {

            // drop functionality
            document.body.ondrop = (e) => {

                [].forEach.call(e.dataTransfer.files, (file) => {

                    this.addProject(file.path)
                })

                e.preventDefault()
            }

            // listen for the open dialog command
            this.$root.$on('open-dialog', this.openDialog)
            this.$root.$on('remove-project', this.removeProject)
            this.$root.$on('update-project', this.updateProject)

            storage.get('projects', (e, result) => {

                if (e) throw e

                if (result.length) {

                    this.projects = result
                }
            })

            this.$watch('projects', (newVal, oldVal) => {

                // note: newVal == oldVal when mutating array!
                console.log('projects changes')

            })
        },

        components: {

            Project
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

            addProject(folder) {

                // check if the added path is actually a directory
                // @TODO: fail gracefully
                if (fs.lstatSync(folder).isDirectory()) {

                    const project = {

                        id: require('shortid').generate(),
                        name: 'Untitled project',
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

            updateProject() {

                storage.set('projects', this.projects, (e) => {

                    if (e) throw e
                })
            },

            removeProject(project) {

                this.projects = this.projects.filter((item) => {

                    return item != project
                })

                //@TODO: move this to the background window
                //@TODO: send the updated projects to the watcher
                storage.set('projects', this.projects, (e) => {

                    if (e) throw e
                })
            },

            openDialog() {

                const bWin = require('electron').remote.getCurrentWindow()

                dialog.showOpenDialog(bWin, {

                    properties: ['openDirectory'],

                }, (filePaths) => {

                    if (filePaths) {

                        this.addProject(filePaths[0])
                    }
                })
            }
        }
    }
</script>

<style lang="sass">

    #projects {

        -webkit-app-region: no-drag;
        height: calc(100vh - 38px);
        overflow: scroll;

        .has-drop-area & {

            overflow: hidden;

            &:before {

                display: block;
                content: '';
                position: absolute;
                top: 38px;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 2;
                background-color: rgba(#fff, .92);
            }

            &:after {

                display: block;
                content: '';
                position: absolute;
                top: 38px;
                left: 0;
                right: 0;
                bottom: 0;
                margin: 12px;
                border: 3px dashed darkgray;
                border-radius: 2px;
                z-index: 3;
            }
        }
    }
</style>