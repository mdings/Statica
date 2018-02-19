const electron = require('electron')
const { ipcMain, app, BrowserWindow, Tray } = require('electron')

const fs = require('fs')
const path = require('upath')
const url = require('url')
const store = require('./src/app/persist.cjs')
const keytar = require('keytar')
const parse = require('parse-git-config')
const settings = require('electron-settings')

const bw = {}

const updateBounds = windowName => {
    const bounds = settings.get('bounds') || {}
    bounds[windowName] = bw[windowName].getBounds()
    settings.set('bounds', bounds)
}

app.on('ready', () => {
    bw.projects = new BrowserWindow({
        maximizable: false,
        width: 320,
        height: 500,
        frame: false,
        titleBarStyle: 'hiddenInset',
        show: true,
    })

    bw.deployers = new BrowserWindow({
        width: 500,
        height: 500,
        minimizable: false,
        maximizable: false,
        frame: false,
        fullscreenable: false,
        titleBarStyle: 'hiddenInset',
        show: false
    })

    bw.worker = new BrowserWindow({
        width: 300,
        height: 300,
        show: true
    })

    bw.projects.loadURL(`file://${__dirname}/projects.html`)
    bw.deployers.loadURL(`file://${__dirname}/services.html`)
    bw.worker.loadURL(`file://${__dirname}/worker.html`)

    // Restore the original window positions for the projects and exports windows
    if (settings.has('bounds.projects')) {
        bw.projects.setBounds(settings.get('bounds.projects'))
    }

    if (settings.has('bounds.deployers')) {
        bw.deployers.setBounds(settings.get('bounds.deployers'))
    }

    // Listen to events on the windows
    bw.projects.on('close', e => {
        if (bw.projects) {
            bw.projects.hide()
            e.preventDefault()
        }
    })

    bw.deployers.on('close', e => {
        if (bw.deployers) {
            bw.deployers.webContents.send('emptyServices')
            bw.deployers.hide()
            e.preventDefault()
        }
    })

    bw.deployers.on('move', () => updateBounds('deployers'))
    bw.deployers.on('resize', () => updateBounds('deployers'))
    bw.projects.on('move', () => updateBounds('projects'))
    bw.projects.on('resize', () => updateBounds('projects'))
})

app.on('activate', () => {
    bw.projects.show()
})

app.on('before-quit', () => {
    delete bw.projects
    delete bw.deployers
    delete bw.worker
})

// Communications!

ipcMain.on('showServicesWindow', (e, {id}) => {
    bw.deployers.webContents.send('getServicesForProject', id)
    bw.deployers.show()
})

// ipcMain.on('createCompiler', (e, project) => {
//     bw.worker.webContents.send('createCompiler', project)
// })

// ipcMain.on('removeCompiler', (e, project) => {
//     bw.worker.webContents.send('removeCompiler', project.id)
// })

// ipcMain.on('optimizeProject', (e, id) => {
//     bw.worker.webContents.send('optimizeProject', id)
// })

// ipcMain.on('doneOptimizeProject', (e, project) => {
//     bw.deployers.webContents.send('doneOptimizeProject', project)
// })

// ipcMain.on('projectError', (e, data) => {
//     bw.projects.webContents.send('projectError', data)
// })

// ipcMain.on('statusUpdate', (e, data) => {
//     bw.projects.webContents.send('statusUpdate', data)
// })

// ipcMain.on('unlinkProject', (e, project) => {
//     project.unlinked = true
//     store.setProjectById(project)
//     bw.projects.webContents.send('reloadProjects', store.getAllProjects())
// })

// ipcMain.on('startServer', (e, project) => {
//     bw.worker.webContents.send('startServer', project)
// })

// ipcMain.on('storePassword', (e, details) => {
//     console.log('setting password', details.password)
//     keytar.setPassword('statica', details.serviceId, details.password)
// })

// ipcMain.on('retrievePassword', (e, serviceId) => {
//     keytar.getPassword(`statica`, serviceId).then(password => {
//         console.log('getting password', password)
//         e.returnValue = password
//     })
// })

// ipcMain.on('reloadActiveProject', e => {
//     bw.deployers.webContents.send('reloadActiveProject')
// })

// ipcMain.on('setServiceStatus', (e, status, service, message = null) => {
//     console.log('receiving set service status', status, service)
//     bw.deployers.webContents.send('setServiceStatus', status, service)
// })
