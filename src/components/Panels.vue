<<template>
    <div id="panels">
        <div class="buttons">
            <a @click="setActive('projects')" :class="{active: active == 'projects'}">Projects</a>
            <a @click="setActive('logs')" :class="{active: active == 'logs'}">Log
                <span class="badge" v-show="badge > 0">{{badgeCount}}</span>
            </a>
        </div>
    </div>
</template>

<script>
export default {

    data() {

        return {

            badge: 0,
            active: 'projects'
        }
    },

    computed: {

        badgeCount() {

            return this.badge > 99 ? '99+' : this.badge
        }
    },

    created() {

        this.$root.$on('logs-badge', num => {

            this.badge = num
        })
    },

    methods: {

        setActive(panel) {

            this.active = panel
            this.$root.$emit('setActive', panel)
        }
    },
}
</script>

<style lang="sass">

    #panels {

        padding: 15px 20px;
        border-bottom: 1px solid #f1f1f1;

         .is-scrolling-down & {

            margin-top: -36px;
        }
    }

    .buttons {

        z-index: 9;
        border: 1px solid #BCDDF6;
        color: mix(#BCDDF6, #000, 55%);
        display: flex;
        min-height: 26px;
        justify-content: center;
        font-size: 14px;
        border-radius: 6px;
        transition: margin ease-out 250ms;
        overflow: hidden;

        a {

            flex-basis: 50%;
            line-height: 24px;
            text-align: center;
        }

        .active {

            background-color: #BCDDF6;
        }

        .badge {

            display: inline-flex;
            justify-content: center;
            align-items: center;
            max-width: 30px;
            height: 18px;
            border-radius: 4px;
            padding: 0 6px;
            margin-left: 1px;
            font-size: 10px;
            background-color: mix(#BCDDF6, #000, 55%);
            color: #fff;
        }
    }
</style>
