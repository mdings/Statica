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
        <Projects></Projects>
    </main>
</template>

<script>

    import Titlebar from './Titlebar.vue'
    import Projects from './Projects.vue'

    const {ipcRenderer} = require('electron')
    let isDragging = false


    export default {

        components: {

            Projects,
            Titlebar
        },

        created() {

            ipcRenderer.on('notify', (e, message) => {

                let myNotification = new Notification('Title', {

                    body: message
                })
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

<style lang="sass">

    @import "src/mixins/reset";

    main {

        height: 100vh;
        display: flex;
        flex-direction: column;
        -webkit-app-region: drag;

        &.has-drop-area {

            &:after {

                display: block;
                content: attr(hint);
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 5;
                color: darkgray;
                font-size: 21px;
            }
        }
    }

</style>