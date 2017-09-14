const electron = require('electron')
const {ipcMain, app, BrowserWindow, Tray} = require('electron')

const fs = require('fs')
const path = require('upath')
const url = require('url')
const store = require('./src/vuex/persist')
const keytar = require('keytar')
const parse = require('parse-git-config')

const windows = require('./windows')

let services
let worker
let projects

if (process.env.NODE_ENV === 'development') {

    require('electron-reload')(__dirname)
}

// Don't show the app in the doc, we have doc
// app.dock.hide()

const kickoff = () => {

    services = windows.create('services', {
        width: 500,
        height: 500,
        minimizable: false,
        maximizable: false,
        frame: false,
        fullscreenable: false,
        titleBarStyle: 'hiddenInset',
        show: false
    })

    worker = windows.create('worker', {
        width: 300,
        height: 300,
        show: true
    })

    projects = windows.create('projects', {
        maximizable: false,
        width: 320,
        height: 500,
        frame: false,
        titleBarStyle: 'hiddenInset',
        show: true,
    })
}

const listen = () => {

    services.on('close', e => {

        services.webContents.send('emptyServices')
        services.hide()
        e.preventDefault()
    })

    // Wait for the contents to load, then load the projects
    projects.webContents.on('did-finish-load', () => {})
}


app.on('ready', () => {

    kickoff()
    listen()
})


// Communications!

ipcMain.on('showExportersWindow', (e, project) => {

    // Reload the project from memory when re-opening the window
    store.getProjectById(project.id).then(project => {

        services.webContents.send('setActiveProject', project)
        services.show()
    })
})

ipcMain.on('project-ready', (e, project) => {

    projects.webContents.send('project-ready', project)
})

ipcMain.on('create-compiler', (e, project) => {

    worker.webContents.send('create-compiler', project)
})

ipcMain.on('remove-compiler', (e, project) => {

    worker.webContents.send('remove-compiler', project.id)
})

ipcMain.on('project-error', (e, data) => {

    projects.webContents.send('project-error', data)
})

ipcMain.on('status-update', (e, data) => {

    projects.webContents.send('status-update', data)
})

ipcMain.on('unlink-project', (e, project) => {

    project.unlinked = true

    store.setProjectById(project).then(() => {

        store.getAllProjects().then(results => {

            projects.webContents.send('reload-projects', results)
        })
    })
})

ipcMain.on('startServer', (e, project) => {

    worker.webContents.send('startServer', project)
})

ipcMain.on('storePassword', (e, details) => {

    keytar.replacePassword('statica', details.serviceId, details.password)
})

ipcMain.on('retrievePassword', (e, details) => {

    const password = keytar.getPassword(`statica`, details.serviceId)
    services.webContents.send('retrievePassword', password)
})

ipcMain.on('reloadActiveProject', e => {

    services.webContents.send('reloadActiveProject')
})

ipcMain.on('set-service-status', (e, status, service, message = null) => {

    console.log('receiving set service status', status, service)
    services.webContents.send('set-service-status', status, service)
})
