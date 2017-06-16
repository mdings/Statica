<template>
    <div id="projects">
        <Project v-for="project in projects" :project="project"></Project>
    </div>
</template>

<script>

    import Project from './Project.vue'

    const path = require('upath')
    const fs = require('fs')
    const {dialog} = require('electron').remote
    const {ipcRenderer} = require('electron')
    const store = require('../store')

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

            // @TODO: move these two to project component and handle the operations by the store. Also saves some communication
            this.$root.$on('remove-project', this.removeProject)
            this.$root.$on('update-project', this.updateProject)

            ipcRenderer.on('projects-loaded', this.loadProjects)
            ipcRenderer.on('reload-projects', this.reloadProjects)

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

                // storage.clear((e) => {

                //     if (e) throw e

                //     this.projects = []
                // })
            },

            loadProjects(e, projects) {

                this.projects = projects
                console.log('projects loaded')
            },

            reloadProjects(e, projects) {

                this.projects = projects
            },

            addProject(folder, name) {

                // check if the added path is actually a directory
                // @TODO: fail gracefully
                if (fs.lstatSync(folder).isDirectory()) {

                    const project = {

                        id: require('shortid').generate(),
                        name: path.basename(folder),
                        path: folder,
                        services: [],
                        isRunning: false
                    }

                    this.projects.push(project)

                    ipcRenderer.send('create-compiler', project)

                    // Persist to db
                    store.setAllProjects(this.projects)
                }
            },

            updateProject() {

                store.setAllProjects(this.projects)
            },

            removeProject(project) {

                this.projects = this.projects.filter((item) => {

                    return item != project
                })

                store.setAllProjects(this.projects)

                ipcRenderer.send('remove-compiler', project)
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