import { Project } from './models'

const electron = require('electron')
const remote = electron.remote
const { ipcRenderer } = electron
const { dialog, Menu, MenuItem } = remote
const fs = require('fs')

export const openDialog = actions => {
    const currentWindow = remote.getCurrentWindow()
    dialog.showOpenDialog(currentWindow, {
        properties: ['openDirectory'],
    }, filePaths => {
        if (filePaths) {
            const folder = filePaths[0]
            if (fs.lstatSync(folder).isDirectory()) {
                const project = Project(folder)
                actions.add(project)
            }
        }
    })
}

export const openMenu = (actions, project) => {
    const template = [{
        label: 'Refresh project',
        click() { console.log(actions )}
    }, {
        label: 'Open page',
        click() { actions.startServer(project) }
    }, {
        type: 'separator'
    }, {
        label: 'Deploy..',
        click() {
            ipcRenderer.send('showServicesWindow', project)
        }
    }, {
        type: 'separator'
    }, {
        label: 'Remove project',
        click() { actions.remove(project) }
    }]
    const menu = Menu.buildFromTemplate(template)
    menu.popup(remote.getCurrentWindow())
}