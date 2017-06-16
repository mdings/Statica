const {ipcMain, app, BrowserWindow} = require('electron')

const path = require('path')
const url = require('url')
const store = require('./src/store')
const keytar = require('keytar')

if (process.env.NODE_ENV === 'development') {

    require('electron-reload')(__dirname)
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let projectsWindow
let workerWindow
let exportersWindow


function createWindow () {

    exportersWindow = new BrowserWindow({

        width: 500,
        height: 500,
        minimizable: false,
        maximizable: false,
        frame: false,
        fullscreenable: false,
        show: false
    })

    if (process.env.NODE_ENV === 'development') {

        exportersWindow.loadURL(`http://localhost:8080/services.html`)

    } else {

        exportersWindow.loadURL(`file://${__dirname}/services.html`)
    }

    exportersWindow.on('close', (e) => {

        if (exportersWindow) {

            exportersWindow.webContents.send('emptyServices')
            exportersWindow.hide()
            e.preventDefault()
        }
    })

    workerWindow = new BrowserWindow({
        width: 300,
        height: 300,
        // show: false
    })

    workerWindow.loadURL(url.format({

    pathname: path.join(__dirname, 'worker.html'),

        protocol: 'file:',
        slashes: true,
    }))

    // workerWindow.webContents.openDevTools()

    // Create the browser window.
    projectsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        // titleBarStyle: 'hidden-inset',
        webPreferences: {

            // scrollBounce: true
        }
    })

    // and load the index.html of the app.
    if (process.env.NODE_ENV === 'development') {

        projectsWindow.loadURL(`http://localhost:8080/projects.html`)

    } else {

        projectsWindow.loadURL(`file://${__dirname}/projects.html`)
    }

    // Open the DevTools.
    projectsWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    projectsWindow.on('closed', function () {

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        projectsWindow = null
        workerWindow = null
    })

    // Wait for the contents to load, then load the projects
    projectsWindow.webContents.on('did-finish-load', () => {

        store.getAllProjects().then(projects => {

            // Send the project to the compiler
            if (Object.prototype.toString.call(projects) === '[object Array]') {

                projects.forEach(project => {

                    // Don't create no compiler for projects flagged as unlinked
                    if (!project.unlinked) {

                        workerWindow.webContents.send('create-compiler', project)
                    }
                })
            }

            projectsWindow.webContents.send('projects-loaded', Array.from(projects))
        })
    })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {

        app.quit()
    }
})

app.on('activate', function () {

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (projectsWindow === null) {
        createWindow()
    }
})

app.on('before-quit', function() {

    exportersWindow = null
})

// communications
ipcMain.on('showExportersWindow', (e, project) => {

    exportersWindow.webContents.send('setActiveProject', project)
    exportersWindow.show()
})

ipcMain.on('create-compiler', (e, project) => {

    workerWindow.webContents.send('create-compiler', project)
})

ipcMain.on('remove-compiler', (e, project) => {

    workerWindow.webContents.send('remove-compiler', project.id)
})

ipcMain.on('unlink-project', (e, project) => {

    project.unlinked = true
    store.setProjectById(project).then(() => {

        store.getAllProjects().then(projects => {

            projectsWindow.webContents.send('reload-projects', projects)
        })
    })
})

ipcMain.on('startServer', (e, project) => {

    workerWindow.webContents.send('startServer', project)
})

ipcMain.on('storePassword', (e, details) => {

    keytar.replacePassword('statica', details.serviceId, details.password)
})

ipcMain.on('retrievePassword', (e, details) => {

    const password = keytar.getPassword(`statica`, details.serviceId)
    exportersWindow.webContents.send('retrievePassword', password)
})

ipcMain.on('reloadActiveProject', e => {

    exportersWindow.webContents.send('reloadActiveProject')
})

