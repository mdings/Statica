<template>
    <div class="log">
        <div class="file">Failed to compile {{log.filename}} in {{log.project.name}}</div>
        <div class="message">{{log.message}}</div>
    </div>
</template>

<script>
    export default {

        props: ['log']
    }
</script>

<style lang="sass">
    .log {

        font-size: 13px;

        .file {

            font-weight: bold;
        }

        .message {

            font-family: Monospace;
            margin-top: 3px;
        }

        & + & {

            margin-top: 10px;
        }
    }
</style>

