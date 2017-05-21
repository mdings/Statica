<template>
    <div @click="setActiveService(service)">{{service.name}}</div>
</template>

<script>
    export default {

        props: ['service'],

        created() {

        },

        methods: {

            setActiveService(service) {

                this.$root.$emit('setActiveService', service)
            }
        }
    }
</script>