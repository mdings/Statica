<template>
    <main class="window"
        @dragenter="handleDragEnter"
        @drop="handleDrop"
        @dragend="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="sendClickEvent"
        hint="Drop folders here">
        <Titlebar></Titlebar>
        <Projects></Projects>
        <StatusBar></StatusBar>
    </main>
</template>

<script>

    import Titlebar from './Titlebar.vue'
    import Projects from './Projects.vue'
    import StatusBar from './StatusBar.vue'

    const {ipcRenderer} = require('electron')
    let isDragging = false

    export default {

        components: {

            Titlebar,
            Projects,
            StatusBar
        },

        created() {

            // ipcRenderer.on('notify', (e, message) => {

            //     let myNotification = new Notification('Title', {

            //         body: message
            //     })
            // })

            // window.addEventListener('mousewheel', (e) => {

            //     this.$el.classList.toggle('is-scrolling-down',
            //         e.deltaY > 0 && e.srcElement.scrollHeight > e.srcElement.parentNode.clientHeight)
            // }, false)

            // this.$root.$on('setActive', panel => {

            //     this.active = panel
            // })
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
<style lang="scss">
    @import "../../sass/components/window";

    *,
    *:before,
    *:after {

        margin: 0;
        padding: 0;
        outline: none;
        box-sizing: border-box;
        cursor: default;
        -webkit-user-select: none;
    }

    .window {

        @extend %window;
    }
</style>
