<template>
    <header>
        <TrafficLights></TrafficLights>
        <input type="search" placeholder="Search project">
        <button @click="openDialog">
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/></svg>
        </button>
    </header>
</template>

<script>

    import TrafficLights from './TrafficLights.vue'

    export default {

        components: {

            TrafficLights
        },

        methods: {

            openDialog() {

                this.$root.$emit('open-dialog')
            }

        }
    }
</script>

<style lang="sass" scoped>

    @import "src/mixins/header";
    @import "src/mixins/inputs";

    header {

        height: 45px;
        flex: 0 0 45px;
    }

    button {

        width: 30px;
        position: relative;
        margin: 0 10px 0 auto;
        -webkit-app-region: no-drag;

        svg {

            position: absolute;
            top: 50%;
            left: 50%;
            width: 23px;
            height: auto;
            fill: #222;
            transform: translate(-50%, -50%);
        }
    }


</style>