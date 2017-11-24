const electron = require('electron')
const {ipcMain, app, BrowserWindow, Tray} = require('electron')

const fs = require('fs')
const path = require('upath')
const url = require('url')
const store = require('./src/app/vuex/persist')
const keytar = require('keytar')
const parse = require('parse-git-config')
const settings = require('electron-settings')

console.log(keytar)
const windows = require('./windows')

let services
let worker
let projects

if (process.env.NODE_ENV === 'development') {

    // require('electron-reload')(`${__dirname}/dist/`)
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

    if (settings.has('bounds.services')) {

        services.setBounds(settings.get('bounds.services'))
    }

    worker = windows.create('worker', {
        width: 300,
        height: 300,
        show: true
    })

    worker.webContents.openDevTools()

    projects = windows.create('projects', {
        maximizable: false,
        width: 320,
        height: 500,
        frame: false,
        titleBarStyle: 'hiddenInset',
        show: true,
    })

    if (settings.has('bounds.projects')) {

        projects.setBounds(settings.get('bounds.projects'))
    }
}

const listen = () => {

    services.on('close', e => {

        services.webContents.send('emptyServices')
        services.hide()
        e.preventDefault()
    })

    services.on('move', e => {

        // Set project bounds for the services window
        const bounds = settings.get('bounds') || {}
        bounds.services = services.getBounds()
        settings.set('bounds', bounds)
    })

    services.on('resize', e => {

        // Set project bounds for the services window
        const bounds = settings.get('bounds') || {}
        bounds.services = services.getBounds()
        settings.set('bounds', bounds)
    })

    projects.on('move', e => {

        // Set project bounds for the services window
        const bounds = settings.get('bounds') || {}
        bounds.projects = projects.getBounds()
        settings.set('bounds', bounds)
    })

    projects.on('resize', e => {

        const bounds = settings.get('bounds') || {}
        bounds.projects = projects.getBounds()
        settings.set('bounds', bounds)
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
    console.log(store.getProjectById(project))
    services.webContents.send('setActiveProject', store.getProjectById(project))
    services.show()

    // Reload the project from memory when re-opening the window
    // store.getProjectById(project.id).then(project => {

    //     services.webContents.send('setActiveProject', project)
    //     services.show()
    // })
})

ipcMain.on('create-compiler', (e, project) => {

    worker.webContents.send('create-compiler', project)
})

ipcMain.on('remove-compiler', (e, project) => {

    worker.webContents.send('remove-compiler', project.id)
})

ipcMain.on('optimize-project', (e, id) => {

    worker.webContents.send('optimize-project', id)
})

ipcMain.on('done-optimize-project', (e, project) => {

    services.webContents.send('done-optimize-project', project)
})

ipcMain.on('project-error', (e, data) => {

    projects.webContents.send('project-error', data)
})

ipcMain.on('status-update', (e, data) => {

    projects.webContents.send('status-update', data)
})

ipcMain.on('unlink-project', (e, project) => {

    project.unlinked = true

    store.setProjectById(project)
    projects.webContents.send('reload-projects', store.getAllProjects())

    // store.setProjectById(project).then(() => {

    //     store.getAllProjects().then(results => {

    //         projects.webContents.send('reload-projects', results)
    //     })
    // })
})

ipcMain.on('startServer', (e, project) => {

    worker.webContents.send('startServer', project)
})

ipcMain.on('storePassword', (e, details) => {

    console.log('setting password', details.password)
    keytar.setPassword('statica', details.serviceId, details.password)
})

ipcMain.on('retrievePassword', (e, serviceId) => {

    keytar.getPassword(`statica`, serviceId).then(password => {
        console.log('getting password', password)
        e.returnValue = password
    })

})

ipcMain.on('reloadActiveProject', e => {

    services.webContents.send('reloadActiveProject')
})

ipcMain.on('set-service-status', (e, status, service, message = null) => {

    console.log('receiving set service status', status, service)
    services.webContents.send('set-service-status', status, service)
})
