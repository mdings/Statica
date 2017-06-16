<template>
    <ul>
        <li @click="closeWindow">close</li>
        <li>minimize</li>
        <li>expand</li>
    </ul>
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

    ul {

        display: flex;
        margin-left: 10px;
        margin-right: 10px;
        list-style: none;

        li {

            text-indent: -100px;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            margin: 0 2px;
            border: 1px solid #ccc;
        }
    }
</style>
