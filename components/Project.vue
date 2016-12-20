<template>
    <div class="project" @click="startProject(project)">

        {{project.name}}
    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')

    export default {

        props: ['project'],

        created() {

        },

        methods: {

            startProject(project) {

                ipcRenderer.send('start-server', project.id)
            }
        }
    }

</script>

<style lang="sass">

    .project {

        border-bottom: 1px solid #ccc;
        padding: 20px 10px;
    }
</style>