<template>
    <section id="projects" v-bind:class="{ empty: !projects.length }">
        <div class="projects__divider" v-show="favProjects.length" data-sticky-container>
            <span class="sticky">Favourites</span>
            <Project v-for="project in favProjects" :key="project.id" :project="project"></Project>
        </div>

        <div class="projects__divider" data-sticky-container>
            <span class="sticky" v-show="otherProjects.length && favProjects.length">Others</span>
            <Project v-for="project in otherProjects" :key="project.id" :project="project"></Project>
        </div>

        <div v-show="!projects.length" class="emptystate">
            There a no projects yet. Click the '+' to add a new folder or drag and drop one in the projects area.
        </div>
    </section>
</template>

<script>

    import Project from './Project.vue'

    const path = require('upath')
    const fs = require('fs')
    const persist = require('../../vuex/persist')
    const {dialog} = require('electron').remote
    const {ipcRenderer} = require('electron')
    const parse = require('parse-git-config')

    export default {

        created() {

            // When the app is started, load in all the projects and send them to the main process to create a compiler for them. When the project is initialised the project can be unblocked
            persist.getAllProjects().then(projects => {

                projects.forEach(project => {

                    // Check if the path still exists for the project
                    if (!fs.existsSync(project.path)) {

                        project.unlinked = true

                    } else {

                        project.blocked = true
                    }

                    // Check if the project is coming from git and append that to the project before sending it to the UI
                    const config = parse.sync({
                        cwd: project.path,
                        path: '.git/config'
                    })

                    if (config['remote "origin"']) {

                        project.repo = config['remote "origin"'].url
                    }

                    // Persist to storage
                    persist.setProjectById(project)

                    this.projects.push(project)

                    // Create the compiler
                    ipcRenderer.send('create-compiler', project)
                })
            })

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

            ipcRenderer.on('project-ready', this.enableProject)
            // ipcRenderer.on('projects-loaded', this.loadProjects)
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

            enableProject(e, project) {

                this.projects.map(oProject => {

                    if (oProject.id == project.id) {

                        oProject.blocked = false
                    }

                    return oProject
                })
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
                        blocked: true,
                        path: folder,
                        services: [],
                        isRunning: false
                    }

                    this.projects.push(project)

                    ipcRenderer.send('create-compiler', project)

                    // Persist to db
                    this.$store.dispatch('saveProjects', this.projects)
                }
            },

            updateProject() {

                this.$store.dispatch('saveProjects', this.projects)
            },

            removeProject(project) {

                this.projects = this.projects.filter((item) => {

                    return item != project
                })

                this.$store.dispatch('saveProjects', this.projects)

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