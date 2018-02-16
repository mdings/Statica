<template>
    <div class="statusbar">
        Watching {{count}} projects
    </div>
</template>
<script>
    export default {
        computed: {
            count() {
                return this.$store.getters.projects.length
            }
        }
    }
</script>
<style lang="scss">
    @import "../../sass/components/statusbar";

    .statusbar {

        @extend %statusbar;
    }
</style>

