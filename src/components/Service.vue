<template>
    <div @click="setActiveService(service)" class="service">
        <span>{{service.title}}</span>
        <span class="service-type">{{service.type}}</span>
    </div>
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

<style type="sass" scoped>

    .service {

        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .service-type {

        font-size: 12px;
        font-weight: bold;
    }
</style>