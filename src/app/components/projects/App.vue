<template>
    <main
        @dragenter="handleDragEnter"
        @drop="handleDrop"
        @dragend="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="sendClickEvent"
        hint="Drop folders here">
        <Titlebar></Titlebar>
        <Projects v-show="active == 'projects'"></Projects>
    </main>
</template>

<script>

    import '../../sass/main.scss'
    import Titlebar from '../shared/Titlebar.vue'
    import Projects from './Projects.vue'

    const {ipcRenderer} = require('electron')
    let isDragging = false

    export default {

        components: {

            Titlebar,
            Projects,
        },

        data() {

            return {

                active: 'projects'
            }
        },

        created() {

            ipcRenderer.on('notify', (e, message) => {

                let myNotification = new Notification('Title', {

                    body: message
                })
            })

            window.addEventListener('mousewheel', (e) => {

                this.$el.classList.toggle('is-scrolling-down',
                    e.deltaY > 0 && e.srcElement.scrollHeight > e.srcElement.parentNode.clientHeight)
            }, false)

            this.$root.$on('setActive', panel => {

                this.active = panel
            })
        },

        methods: {

            handleDragEnter() {

                isDragging = true
                this.$el.classList.add('has-drop-area')
            },

            handleDragOver(e) {

                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                return false
            },

            handleDrop() {

                this.$el.classList.remove('has-drop-area')
                isDragging = false
            },

            handleDragLeave(e) {

                if (!isDragging) {

                    this.$el.classList.remove('has-drop-area')
                    return
                }

                isDragging = false
            },

            sendClickEvent() {

                this.$root.$emit('app-click')
            }
        }
    }

</script>