const {ipcMain, app, BrowserWindow, Tray} = require('electron')

const fs = require('fs')
const path = require('path')
const url = require('url')
const store = require('./src/store')
const keytar = require('keytar')

const windows = require('./windows')

let tray
let logs
let services
let worker
let projects

if (process.env.NODE_ENV === 'development') {

    require('electron-reload')(__dirname)
}

// Don't show the app in the doc, we have doc
// app.dock.hide()

const kickoff = () => {

    // Create the tray
    tray = new Tray(path.join(__dirname, 'src/img/iconTemplate@2x.png'))

    // Create the four windows
    logs = windows.create('logs', {
        width: 250,
        height: 155,
        minHeight: 155,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        alwaysOnTop: true
    })

    services = windows.create('services', {
        width: 500,
        height: 500,
        minimizable: false,
        maximizable: false,
        frame: false,
        fullscreenable: false,
        show: false
    })

    worker = windows.create('worker', {
        width: 300,
        height: 300,
        show: true
    })

    projects = windows.create('projects', {
        width: 320,
        height: 500,
        frame: false,
        show: true,
    })
}

const listen = () => {

    // Hide the window when it loses focus
    logs.on('blur', e => {

        logs.hide()
        e.preventDefault()
    })

    // Toggle the tray window on cick
    tray.on('click', e => {

        const position = windows.getPosition(logs, tray)
        logs.setPosition(position.x, position.y, false)
        windows.toggle(logs)
    })

    services.on('close', e => {

        services.webContents.send('emptyServices')
        services.hide()
        e.preventDefault()
    })

    // Wait for the contents to load, then load the projects
    projects.webContents.on('did-finish-load', () => {

        store.getAllProjects().then(results => {

            // Send the project to the compiler
            if (Object.prototype.toString.call(results) === '[object Array]') {

                results.forEach(project => {

                    // Check if the project folder still existst when booting
                    if (!fs.existsSync(project.path)) {

                        project.unlinked = true

                    } else {

                        // Create a new project in the worker
                        worker.webContents.send('create-compiler', project)
                    }
                })
            }

            // Let the DOM know that we done loading
            projects.webContents.send('projects-loaded', Array.from(results))
        })
    })
}


app.on('ready', () => {

    kickoff()
    listen()
})


// Communications!

ipcMain.on('show-window', () => {

  windows.show(logs, false)
})

ipcMain.on('showExportersWindow', (e, project) => {

    services.webContents.send('setActiveProject', project)
    services.show()
})

ipcMain.on('create-compiler', (e, project) => {

    worker.webContents.send('create-compiler', project)
})

ipcMain.on('remove-compiler', (e, project) => {

    worker.webContents.send('remove-compiler', project.id)
})

ipcMain.on('project-error', (e, data) => {

    logs.webContents.send('project-error', data)
    projects.webContents.send('project-error', data)
    windows.show(logs, false)
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


