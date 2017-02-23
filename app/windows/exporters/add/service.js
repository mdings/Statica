const store = require('../../../store')
const {ipcRenderer} = require('electron')
const remote = require('electron').remote

// Close button
document.querySelector('[data-close-exports]').addEventListener('click', () => {

    remote.getCurrentWindow().hide()
})

// Add to externals
document.querySelector('[data-exports-add]').addEventListener('click', () => {

    ipcRenderer.send('updateProjectExporters', {
        name: 'Github Pages'
    })

    // First update, hide the sheet
    setTimeout(() => {

        remote.getCurrentWindow().hide()
    }, 10)
})