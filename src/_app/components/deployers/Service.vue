<template>
    <div @click="setActiveService(service)" class="service">
        <span class="service-title">{{service.title}}</span>
        <span class="service-type">{{service.type}}</span>
    </div>
</template>

<script>

    export default {

        props: ['service'],

        methods: {

            setActiveService(service) {

                this.$store.dispatch('setActiveService', service)
            }
        }
    }
</script>

<style lang="scss" scoped>

    @import "../../sass/components/service";

    .service {

        @extend %service;
    }
</style>
