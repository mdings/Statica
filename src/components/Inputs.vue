<template>
    <div id="inputs">
        <select @change="changeExporter">
            <option value="ftp" selected>FTP</option>
            <option value="github">Github pages</option>
        </select>

        <!-- FTP credentials -->
        <div v-show="exporter == 'ftp'" data-ftp>
            <input type="text" name="title" placeholder="title" required>
            <input type="text" name="host" placeholder="host" required>
            <input type="text" name="port" placeholder="port">
            <input type="text" name="username" placeholder="username" required>
            <input type="password" name="password" required>
        </div>
        <!-- /FTP credentials -->

        <!-- Github pages -->
        <div v-show="exporter == 'github'">
            <input type="text" name="title" placeholder="title">
            <input type="text" name="username" placeholder="username">
            <input type="password" name="password">
        </div>
        <!-- /Github pages -->

        <button @click="closePanel">Cancel</button>
        <button @click="addExporter">Ok</button>
    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')
    const ftp = require('ftp-deploy')
    const remote = require('electron').remote
    const store = require('../store')

    export default {

        props: ['project'],

        data() {

            return {

                exporter: 'ftp', // defaults to ftp
            }
        },

        methods: {

            changeExporter(e) {

                this.exporter = e.target.value
            },

            addExporter() {

                // Check if there are any required fields left out blank
                const fields = this.$el.querySelectorAll(`[data-${this.exporter}] [required]`)
                Array.from(fields).forEach(field => {

                    field.classList.toggle('is-invalid', !field.checkValidity())
                })

                const errors = this.$el.querySelectorAll(`[data-${this.exporter}] .is-invalid`)
                if(errors.length) return

                const id = require('shortid').generate()

                let exporter = {
                    type: this.exporter,
                    id: id
                }

                // Get all the inputs that should be processed
                let inputs = this.$el.querySelectorAll(`[data-${this.exporter}] > input`)
                const password = this.findPasswordField(inputs)

                // Store password fields safely with keytar
                if (password) {

                    ipcRenderer.send('storePassword', {

                        // projectId: this.project,
                        serviceId: id,
                        password: password.value
                    })
                }

                // Remove all password fields before storing to json
                Array.from(inputs).filter(input => {

                    return input.getAttribute('type') != 'password'

                }).forEach(input => {

                    exporter[input.getAttribute('name')] = input.value.trim()
                })

                // Add the exporter to the retrieved project
                this.project.services.push(exporter)
                store.setProjectById(this.project)

                // Hide the window
                this.$root.$emit('closeProjectPanel')
            },

            findPasswordField(inputs) {

                return Array.from(inputs).find(input => {

                    return input.getAttribute('type') == 'password'
                })
            },


            closePanel() {

                this.$root.$emit('closeProjectPanel')
            }
        }
    }
</script>

<style lang="sass">

    *,
    *:before,
    *:after {

        margin: 0;
        padding: 0;
        outline: none;
        box-sizing: border-box;
    }

    body {

        font-family: system,-apple-system,".SFNSDisplay-Regular","Helvetica Neue",Helvetica,"Segoe UI",sans-serif;
    }

    #inputs {

    }

    input {

        width: 100%;
        display: block;
        border: 1px solid #ddd;
        height: 30px;
        border-radius: 4px;
        outline: 0;
        padding: 5px 10px;

        &:focus {

            border-color: #6db3fd;
            box-shadow: 3px 3px 0 #6db3fd, -3px -3px 0 #6db3fd, -3px 3px 0 #6db3fd, 3px -3px 0 #6db3fd;
        }

        & + * {

            margin-top: 5px;
        }
    }

    [required].is-invalid {

        border-color: red;
    }
</style>