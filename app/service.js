const {ipcRenderer} = require('electron')

ipcRenderer.on('set-project', (e, project) => {

    console.log(project)
    console.log('setting project')
})

// Close button
document.querySelector('[data-close-exports]').addEventListener('click', () => {

    ipcRenderer.send('close-add-export-window')
})

// Add to externals
document.querySelector('[data-exports-add]').addEventListener('click', () => {

    ipcRenderer.send('add-export-option', {
        name: 'github pages'
    })
})