<template>
    <section id="projects" v-bind:class="{ empty: !projects.length }">
        <div class="projects__divider" v-show="favProjects.length">Favourite projects</div>
        <Project v-for="project in favProjects" :key="project.id" :project="project"></Project>
        <div class="projects__divider" v-show="otherProjects.length && favProjects.length">Other projects</div>
        <Project v-for="project in otherProjects" :key="project.id" :project="project"></Project>
        <div v-show="!projects.length" class="emptystate">
            There a no projects yet. Click the '+' to add a new folder or drag and drop one in the projects area.
        </div>
    </section>
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

        },

        components: {

            Project
        },

        computed: {

            favProjects() {

                return this.projects.filter(project => {

                    return project.favourite
                })
            },

            otherProjects() {

                return this.projects.filter(project => {

                    return !project.favourite
                })
            }
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