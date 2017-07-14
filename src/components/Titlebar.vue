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