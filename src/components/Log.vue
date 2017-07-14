<template>
    <div class="log">
        <div class="message" v-html="log.message"></div>
        <div class="lines">
            <pre v-for="line in log.lines">
                {{line.line.replace(/\s+/, '')}}
            </pre>
        </div>
        <div class="file">
            Failed to compile
            <span class="filename">{{log.filename.base}}</span> in {{log.project.name}}
        </div>
    </div>
</template>

<script>
    export default {

        props: ['log']
    }
</script>

<style lang="sass" scoped>

    .message {

        word-break: break-word;
    }

    .log {

        flex-basis: 100%;
        font-size: 12px;
        padding: 10px;
        border-bottom: 1px solid #f1f1f1;
    }

    .lines {

        word-break: break-word;
        margin-top: 10px;
        border-left: 3px solid #D63230;
        padding: 7px;
        background-color: lemonchiffon;
        font-family: monospace;

        pre {

            white-space: normal;
        }
    }

    .file {

        margin-top: 10px;
    }
</style>


