<template>
    <section class="body"  v-bind:class="{ empty: !projects.length }">
        <div class="divider" v-show="favProjects.length" data-sticky-container>
            <span class="sticky">Favourites</span>
            <Project v-for="project in favProjects" :key="project.id" :project="project"></Project>
        </div>

        <div class="divider" data-sticky-container>
            <span class="sticky" v-show="otherProjects.length && favProjects.length">Others</span>
            <Project v-for="project in otherProjects" :key="project.id" :project="project"></Project>
        </div>

        <div v-show="!projects.length" class="emptystate">
            There a no projects yet. Click the '+' to add a new folder or drag and drop one in the projects area.
        </div>
    </section>
</template>

<script>
    const path = require('upath')
    const fs = require('fs')
    const persist = require('../../vuex/persist')
    const {dialog} = require('electron').remote
    const {ipcRenderer} = require('electron')
    import Project from './Project.vue'

    export default {
        created() {
            // When the app is started, load in all the projects and send them to the main process to create a compiler for them. When the project is initialised the project can be unblocked
            this.$store.dispatch('getAllProjects')

            // drop functionality
            document.body.ondrop = (e) => {
                [].forEach.call(e.dataTransfer.files, file => {
                    this.addProject(file.path)
                })
                e.preventDefault()
            }

            // listen for the open dialog command
            this.$root.$on('open-dialog', this.openDialog)

            // @TODO: move these two to project component and handle the operations by the store. Also saves some communication
            this.$root.$on('remove-project', this.removeProject)
            this.$root.$on('update-project', this.updateProject)
            ipcRenderer.on('reloadProjects', this.reloadProjects)
        },

        components: {
            Project
        },

        computed: {
            projects() {
                return this.$store.getters.projects
            },

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

        methods: {

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
                        isRunning: false,
                        status: 'indexing'
                    }

                    // Persist to db
                    this.$store.dispatch('addProject', project)
                }
            },

            updateProject() {
                this.$store.dispatch('saveProjects', this.projects)
            },

            removeProject(project) {
                this.$store.dispatch('removeProject', project)
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
<style lang="scss">
    @import "../../sass/components/body";

    .body {

        @extend %body;
    }
</style>