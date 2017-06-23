<template>
    <div class="project" v-bind:class="[status, {unlinked: project.unlinked}]">
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

            ipcRenderer.on('status-update', this.updateStatus)

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
                status: 'success',
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
            },

            updateStatus(e, data) {

                if (data.project.id == this.project.id) {

                    this.status = data.status
                }
            },
        }
    }

</script>

<style lang="sass">

    @keyframes load8 {

        0% {

            transform: rotate(0deg);
        }

        100% {

            transform: rotate(360deg);
        }

    }

    .project {

        padding: 15px 10px 15px 12px;
        border-bottom: 1px solid #f1f1f1;
        font-size: 13px;
        display: flex;
        justify-content: space-between;

        &.unlinked {

            background-color: red
        }

        &:before {

            flex: 0 0 10px;
            height: 10px;
            align-self: center;
            display: block;
            content: '';
            border-radius: 50%;
            border: 2px solid #ccc;
            margin-right: 10px;
            background-repeat: no-repeat;
            background-position: center;
            transition: all 250ms linear;
            animation: load8 500ms infinite linear;
        }

        &.success {

            &:before {

                border-color: #32E875;
            }
        }

        &.processing {

            &:before {

                border-width: 5px;
                border-top-color: #333;
                border-right-color: #333;
                transform: translateZ(0);
            }
        }

        &.error {

            &:before {

                border-color: #D63230;
            }
        }
    }

    .project__info {

        flex-grow: 1;
        max-width: 100%;
        overflow: hidden;
    }

    .project__name {

        cursor: default;
        -webkit-user-select: none;
        white-space: nowrap;
        overflow: hidden;
        position: relative;
        text-overflow: ellipsis;
        font-size: 18px;
        color: #333;
        width: 100%;

        &[contenteditable="true"] {

        }

        &:empty:before {

            display: block;
            content: attr(placeholder);
        }
    }

    .project__path {

        cursor: default;
        margin-top: 4px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-size: 11px;
        color: #666;
        width: 100%;
        -webkit-user-select: none;
    }

    .project__actions {

        flex-shrink: 0;
        align-self: center;
        margin-left: 15px;

        svg {

            fill: #157EFB;
            width: 24px;
        }
    }
</style>