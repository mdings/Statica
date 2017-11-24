<template>
    <div class="project" v-bind:class="[{
        unlinked: project.unlinked,
        favourite: project.favourite
    }]">
        <div class="project__body">
            <div class="project__row">
                <svg class="project__fav" @click="toggleFav" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fill-rule="evenodd">
                        <path d="M11.985 18.136L5.187 23l2.35-8.012L1 9.562l7.95-.07L11.985 1l2.95 8.562H23l-6.567 5.478 2.35 7.96-6.798-4.864z"/>
                    </g>
                </svg>
                <div class="project__name"
                    @dblclick="renameProject"
                    @keydown="preventEnter"
                    @keyup="changeName"
                    placeholder="Untitled project"
                    :contenteditable="this.isEditable == true">
                    {{project.name}}
                </div>
            </div>
            <div class="project__row">
                <div><span class="project__status" v-bind:class="project.status"></span></div>
                <div class="project__path">{{project.path}}</div>
            </div>
        </div>
        <svg @click="openOptions" class="project__actions" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48H0z" fill="none"/><path d="M24 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>
    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')
    const {Menu, MenuItem} = require('electron').remote

    export default {

        props: ['project'],

        created() {

            // This triggers a memory leak...
            // find out why and how to prevebt
            // ipcRenderer.on('status-update', this.updateStatus)

            const vm = this

            //@TODO: External template for this
            this.menu = new Menu()

            this.menu.append(new MenuItem({
                label: 'Refresh project',
                click() {
                    vm.refreshProject()
                }
            }))

            this.menu.append(new MenuItem({
                label: 'Open page',
                click() {
                    vm.startProject()
                }
            }))

            this.menu.append(new MenuItem({
                type: 'separator'
            }))

            this.menu.append(new MenuItem({
                label: 'Deploy..',
                click() {
                    ipcRenderer.send('showExportersWindow', vm.project)
                }
            }))

            this.menu.append(new MenuItem({
                type: 'separator'
            }))

            this.menu.append(new MenuItem({
                label: 'Remove project',
                click() {
                    vm.removeProject()
                }
            }))

            this.$root.$on('app-click', () => {

                if (this.isEditable) {

                    this.updateProjectName()
                }
            })

            this.$nextTick(() => {

                this.placeholder = this.project.name
            })

        },

        data() {

            return {

                placeholder: '',
                isEditable: false,
                menu: null
            }
        },

        mounted() {

        },

        methods: {

            startProject() {

                ipcRenderer.send('startServer', this.project.id)
            },

            toggleFav() {

                this.$set(this.project, 'favourite', !this.project.favourite)
                this.$root.$emit('update-project', this.project)
            },

            updateProjectName() {

                // Remove whitespace from name (like enters)
                this.project.name = this.placeholder.replace(/^\s+|\s+$/g, '')
                console.log(this.project.name)
                this.$root.$emit('update-project', this.project)
                this.isEditable = false
            },

            preventEnter(e) {

                if (e.keyCode == 13) {

                    this.updateProjectName()
                    e.preventDefault()
                }
            },

            changeName(e) {

                this.placeholder = e.target.textContent
            },

            refreshProject() {

                console.log('i could refresh')
            },

            removeProject() {

                this.$root.$emit('remove-project', this.project)
            },

            renameProject(e) {

                this.isEditable = true

                // highlight the content by default
                requestAnimationFrame(() => {

                    const range = document.createRange();
                    range.selectNodeContents(e.target);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                });

            },

            openOptions() {

                this.menu.popup(require('electron').remote.getCurrentWindow())
            },

            updateStatus(e, data) {

                if (data.project.id == this.project.id) {

                    this.status = data.status
                }
            },
        }
    }

</script>

<style lang="scss" scoped>

    @import "../../sass/components/project";
</style>
