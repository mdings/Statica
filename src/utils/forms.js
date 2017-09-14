const validation = {

    // Populate the form with the service props when provided
    created() {

        console.log('creating')
        // The methods below get instantiated every time the type of action (add/edit) changes
        if (this.service) {

            Object.assign(this.obj, this.service)
            this.$root.$emit('set-button', false) // sets the update button disabled
        }
    },

    mounted() {

        console.log('mounting')
        this.$root.$on('getFormData', this.getFormData)
    },

    props: ['service'],

    destroyed() {

        console.log('destroying')
        this.$root.$off('getFormData')
    },

    data () {

        return {

            obj: {}
        }
    },

    methods: {

        getFormData() {

            this.$root.$emit('emitFormData', this.obj)
        },

        checkValidity() {

            // Check if there are any required fields left out blank
            const fields = this.$el.querySelectorAll(`[required]`)
            const invalidated = Array.from(fields).filter(field => {

                return !field.checkValidity()
            })

            const disabled = invalidated.length > 0 ? true : false
            this.$root.$emit('set-button', disabled)
        }
    }
}

module.exports = validation