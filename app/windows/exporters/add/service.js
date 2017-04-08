const store = require('../../../store')
const $ = require('../../../utils').$
const e = require('../../../utils').e
const {ipcRenderer} = require('electron')
const remote = require('electron').remote
const options = $('[data-service]')
const project = global.location.search.replace(/\?project\=/i, '')


console.log(project)
// Close button
e($('[data-close-exports]'), e => {

    remote.getCurrentWindow().hide()
})

e(options, 'change', e => {

    console.log(e)
})

// Add to externals
e($('[data-exports-add]'), e => {

    const value = options[options.selectedIndex].value

    ipcRenderer.send('updateProjectExporters', {

        id: project,
        name: options[options.selectedIndex].value,
        password: $('[data-ftp-password]').value
    })

    // First update, hide the sheet
    setTimeout(() => {

        remote.getCurrentWindow().hide()
    }, 10)
})