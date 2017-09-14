<template>
    <div @click="setActiveService(service)" class="service">
        <span class="service-tyle">{{service.title}}</span>
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

<style lang="sass" scoped>

    @keyframes spin {
        100% {
            transform:rotate(360deg);
        }
    }

    .service {

        &.active {

            background-color: #E9F3FE;
        }
    }

    .service-type {

        justify-content: space-between;
        display: flex;
    }

</style>
