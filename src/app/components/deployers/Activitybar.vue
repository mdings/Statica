<template>
    <div class="activity" :class="{'visible': isActivityOpen}">
        <span class="message">{{log}}</span>
        <span class="loader"></span>
    </div>
</template>
<script>
    export default {

        data() {

            return {

                log: '',
                isActivityOpen: false
            }
        },

        created() {

            this.$root.$on('activityLogger', msg => {

                if(!this.isActivityOpen) {

                    this.isActivityOpen = true
                }

                this.log = msg
            })

            this.$root.$on('hideActivityLogger', () => {

                setTimeout(() => {

                    this.isActivityOpen = false
                }, 1500)
            })
        }
    }
</script>
<style lang="scss">
    @import "../../sass/components/activitybar"
</style>

