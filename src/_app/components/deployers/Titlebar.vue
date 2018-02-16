<template>
    <header class="titlebar">
        <span class="title">Deploy to..</span>
        <button @click="toggleForm">
            <svg :class="{'close': isFormOpen}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/></svg>
        </button>
    </header>
</template>

<script>

    import TrafficLights from '../shared/TrafficLights.vue'

    export default {

        components: {

            TrafficLights
        },

        computed: {

            isFormOpen() {

                return this.$store.getters.isFormOpen
            }
        },

        methods: {

            toggleForm() {

                if (this.isFormOpen) {

                    this.$store.dispatch('hideForm')

                } else {

                    this.$store.dispatch('showForm', 'add')
                }
            }
        }
    }
</script>
<style lang="scss">
    @import "../../sass/components/titlebar";

    .titlebar {

        @extend %titlebar;
    }
</style>
