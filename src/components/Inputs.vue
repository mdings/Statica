<template>
    <div>
        <select data-service>
            <option value="github">Github pages</option>
            <option value="azure">Microsoft Azure</option>
            <option value="heroku">Heroku</option>
            <option value="ftp">FTP</option>
        </select>

        <!-- FTP credentials -->
        <input type="text" name="username" placeholder="username" data-ftp-username>
        <input type="password" name="password" data-ftp-password>
        <!-- /FTP credentials -->

        <button data-close-exports @click="closeWindow">Cancel</button>
        <button data-exports-add>Ok</button>
    </div>
</template>

<script>

    const {ipcRenderer} = require('electron')
    const remote = require('electron').remote

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

        methods: {

            closeWindow() {

                remote.getCurrentWindow().hide()
            }
        }
    }
</script>