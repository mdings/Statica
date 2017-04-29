<template>
    <header>
        <input type="search" placeholder="Search">
        <button @click="openDialog">
            <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M61 37H43V19h-6v18H19v6h18v18h6V43h18"/></svg>
        </button>
    </header>
</template>

<script>

    export default {

        methods: {

            openDialog() {

                this.$root.$emit('open-dialog')
            }

        }
    }
</script>

<style lang="sass" scoped>

    @import "src/mixins/inputs";

    header {

        background-color: #e8e6e8;
        box-shadow: inset 0 1px 0 #f5f4f5;
        height: 38px;
        background-image: linear-gradient(to bottom,#e8e6e8 0,#d2d0d2 100%);
        border-bottom: 1px solid #adabad;
        display: flex;
        align-items: center;
        padding-left: 80px;
        padding-right: 8px;
        justify-content: space-between;
    }

    button {

        width: 30px;
        position: relative;
        -webkit-app-region: no-drag;

        svg {

            position: absolute;
            top: 50%;
            left: 50%;
            width: 23px;
            height: auto;
            fill: #222;
            transform: translate(-50%, -50%);
        }
    }


</style>