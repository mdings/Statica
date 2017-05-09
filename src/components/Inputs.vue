<template>
    <div>
        <select @change="changeExporter">
            <option value="github">Github pages</option>
            <option value="azure">Microsoft Azure</option>
            <option value="heroku">Heroku</option>
            <option value="ftp">FTP</option>
        </select>

        <!-- Github pages -->
        <div v-show="exporter == 'github'">
        Github pages
        </div>
        <!-- /Github pages -->

        <!-- Microsoft azure -->
        <div v-show="exporter == 'azure'">
        Microsoft azure
        </div>
        <!-- /Microsoft azure -->

        <!-- Heroku -->
        <div v-show="exporter == 'heroku'" data-heroku>
            <input type="text" name="username" placeholder="username">
            <input type="password" name="password">
            <input type="text" name="server">
        </div>
        <!-- /Heroku -->

        <!-- FTP credentials -->
        <div v-show="exporter == 'ftp'" data-ftp>
            <input type="text" name="username" placeholder="username">
            <input type="password" name="password">
        </div>
        <!-- /FTP credentials -->

        <button @click="closeWindow">Cancel</button>
        <button @click="addExporter">Ok</button>
    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')
    const remote = require('electron').remote
    const store = require('../store')

    // const store = require('./store')
    // const $ = require('./utils').$
    // const e = require('./utils').e
    // const {ipcRenderer} = require('electron')
    // const remote = require('electron').remote
    // const options = $('[data-service]')
    // const project = global.location.search.replace(/\?project\=/i, '')
    // const keytar = require('keytar')

    // // Close button
    // e($('[data-close-exports]'), e => {

    //     remote.getCurrentWindow().hide()
    // })

    // e(options, 'change', e => {

    //     console.log(e)
    // })

    // // Add to externals
    // e($('[data-exports-add]'), e => {

    //     const value = options[options.selectedIndex].value

    //     ipcRenderer.send('updateProjectExporters', {

    //         id: project,
    //         name: options[options.selectedIndex].value,
    //         password: $('[data-ftp-password]').value
    //     })

    //     // First update, hide the sheet
    //     setTimeout(() => {

    //         remote.getCurrentWindow().hide()
    //     }, 10)
    // })
    export default {

        data() {

            return {

                exporter: null,
                project: global.location.search.replace(/\?project\=/i, '')
            }
        },

        methods: {

            changeExporter(e) {

                this.exporter = e.target.value
            },

            addExporter() {

                store.getProjectById(this.project).then(project => {

                    let exporter = {
                        name: this.exporter
                    }

                    const id = require('shortid').generate()
                    // Get all the inputs that should be processed
                    let inputs = this.$el.querySelectorAll(`[data-${this.exporter}] > input`)
                    const password = this.findPasswordField(inputs)

                    // Store password fields safely with keytar
                    if (password) {

                        ipcRenderer.send('storePassword', {

                            project: this.project,
                            id: id,
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
                    project.exporters.push(exporter)
                    store.setProjectById(project)
                    ipcRenderer.send('updateProjects', this.project)

                    setTimeout(() => {

                        remote.getCurrentWindow().hide()
                    }, 10)
                })
            },

            findPasswordField(inputs) {

                return Array.from(inputs).find(input => {

                    return input.getAttribute('type') == 'password'
                })
            },

            closeWindow() {

                remote.getCurrentWindow().hide()
            }
        }
    }
</script>