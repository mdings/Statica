<template>
    <main class="window">
        <Titlebar></Titlebar>
        <Services class="services"></Services>
        <Actionbar></Actionbar>
        <Inputs></Inputs>
    </main>
</template>

<script>

    const remote = require('electron').remote
    import Titlebar from './Titlebar.vue'
    import Services from './Services.vue'
    import Actionbar from './Actionbar.vue'
    import Inputs from './Inputs.vue'

    export default {
        components: {
            Titlebar,
            Services,
            Actionbar,
            Inputs
        },

        computed: {
            activeProject() {
                return this.$store.getters.activeProject
            }
        },

        mounted() {
            // If the active project is not set by the time we have mounted the object, close the window
            if(Object.keys(this.activeProject).length === 0
                && this.activeProject.constructor === Object) {
                remote.getCurrentWindow().hide()
            }
        },
    }
</script>

<style lang="scss">
    @import "../../sass/components/window";
    @import "../../sass/components/body";

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

    .services {
        @extend %body;
    }
</style>
