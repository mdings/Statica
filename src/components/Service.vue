<template>
    <tr @click="setActiveService(service)" class="service">
        <td class="service-tyle">{{service.title}}</td>
        <td class="service-type">
            <span>
                {{service.type}}
            </span>
            <span class="service-status" v-bind:class="[status]" @mousemove="showPopover" @mouseleave="hidePopover" @click="hidePopover">
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" fill="#D63230" fill-rule="evenodd"/>
                </svg>
            </span>
        </td>
    </tr>
</template>

<script>

    const {ipcRenderer} = require('electron')

    export default {

        props: ['service'],

        data() {

            return {
                status: 'unknown'
            }
        },

        created() {

            ipcRenderer.on('set-service-status', (e, status, service) => {

                if (this.service.id == service.id) {

                    this.status = status
                }
            })
        },

        methods: {

            setActiveService(service) {

                this.$root.$emit('setActiveService', service)
            },

            showPopover() {

                console.log('show popver')
                ipcRenderer.send('show-popover', {})
            },

            hidePopover() {

                console.log('show popver')
                ipcRenderer.send('hide-popover', {})
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

    .service-status {

        margin-right: 5px;
        display: block;
        position: relative;
        width: 15px;
        height: 15px;
        opacity: 0;
        transform-origin: 50% 50%;
        transition: all 100ms ease-in;

        svg {

            display: none;
        }

        &:before {

            animation: spin 500ms linear infinite;
            border-radius: 50%;
            border: 1px solid transparent;
            border-top-color: mix(#000, #157EFB, 20%);
            display: block;
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
        }

        &.busy {

            opacity: 1;
        }

        &.error {

            opacity: 1;

            &:before {

                border-color: transparent;
            }

            svg {

                display: block;
            }
        }
    }

</style>
