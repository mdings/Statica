<template>
    <div class="project">
        <div class="project__icon">
            <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><title/><path d="M17 9l-2-4H4.003C2.897 5 2 5.89 2 6.99v18.02c0 1.1.9 1.99 1.993 1.99h25.014c1.1 0 1.993-.893 1.993-1.995v-14.01C31 9.893 30.103 9 28.994 9H17zm-.64 1L14.4 6H3.992C3.444 6 3 6.455 3 6.992v18.016c0 .548.446.992.993.992h25.014c.548 0 .993-.445.993-1V11c0-.552-.454-1-1.003-1H16.36z" fill-rule="evenodd"/></svg>
        </div>
        <div class="project__info">
            <div class="project__name"
                @dblclick="renameProject"
                @keydown="preventEnter"
                @keyup="changeName"
                placeholder="Untitled project"
                :contenteditable="this.isEditable == true">{{project.name}}</div>
            <div class="project__path">{{project.path}}</div>
        </div>
        <div class="project__actions">
            <svg @click="openOptions" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h48v48H0z" fill="none"/><path d="M24 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 4c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>
        </div>
    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')
    const {Menu, MenuItem} = require('electron').remote

    export default {

        props: ['project'],

        created() {

            const vm = this

            //@TODO: External template for this
            this.menu = new Menu()

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
                label: 'Deploy to',
                submenu: [
                    { label: 'Github' },
                    { label: 'Azure' },
                    { type: 'separator' },
                    { label: 'Manage..',
                        click() {
                            ipcRenderer.send('showExportersWindow', vm.project)
                        }
                    }
                ]
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

                ipcRenderer.send('start-server', this.project.id)
            },

            updateProjectName() {

                this.project.name = this.placeholder
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
            }
        }
    }

</script>

<style lang="sass">

    .project {

        padding: 15px 10px;
        border-bottom: 1px solid #ccc;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
        background-color: #f5f5f4;
    }

    .project__icon {

        width: 25px;
        align-self: center;
        flex-shrink: 0;

        svg {

            fill: #157EFB
        }
    }

    .project__name {

        cursor: default;
        -webkit-user-select: none;
        white-space: nowrap;
        width: 200px;
        max-width: 200px;
        overflow: hidden;
        position: relative;
        text-overflow: ellipsis;
        font-size: 16px;

        &[contenteditable="true"] {

        }

        &:empty:before {

            display: block;
            content: attr(placeholder);
        }
    }

    .project__path {

        cursor: default;
        width: 200px;
        max-width: 200px;
        margin-top: 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 12px;
        -webkit-user-select: none;
    }

    .project__actions {

        flex-shrink: 0;
        align-self: center;

        svg {

            fill: #157EFB;
            width: 24px;
        }
    }
</style>