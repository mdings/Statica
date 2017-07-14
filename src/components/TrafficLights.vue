<template>
    <span>
        <a @click="closeWindow">close</a>
        <a>minimize</a>
        <a>expand</a>
    </span>
</template>

<script>
    export default {

        methods: {

            closeWindow() {

                const win = require('electron').remote.getCurrentWindow()
                win.close()
            }
        }
    }
</script>

<style lang="sass" scoped>

    span {

        display: flex;
        margin-left: 10px;
        margin-right: 10px;
        list-style: none;

        a {

            display: inline-flex;
            text-indent: -100px;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            margin: 0 2px;
            border: 1px solid #ccc;
        }

        &:hover {

            a {

                border-color: transparent;

                &:nth-child(1) {

                    background: #ff6159;
                }

                &:nth-child(2) {

                    background: #ffbd2e;
                }

                &:nth-child(3) {

                    background: #28c941;
                }
            }
        }
    }
</style>
