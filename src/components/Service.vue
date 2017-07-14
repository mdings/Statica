<template>
    <tr @click="setActiveService(service)" class="service">
        <td class="service-tyle">{{service.title}}</td>
        <td class="service-type">{{service.type}}</td>
    </tr>
</template>

<script>
    export default {

        props: ['service'],

        created() {

            console.log(this.service)
        },

        methods: {

            setActiveService(service) {

                this.$root.$emit('setActiveService', service)
            }
        }
    }
</script>

<style lang="sass" scoped>

    .service {

        &.active {

            background-color: #E9F3FE;
        }
    }
</style>
