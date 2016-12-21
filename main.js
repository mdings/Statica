const {ipcMain,app, BrowserWindow} = require('electron')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let bgWindow 

function createWindow () {

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {

            scrollBounce: true
        }
    })

    bgWindow = new BrowserWindow({
        width: 300,
        height: 300
    })

    bgWindow.loadURL(url.format({

        pathname: path.join(__dirname, 'worker.html'),

            protocol: 'file:',
            slashes: true
        }))

    bgWindow.webContents.openDevTools()

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({

        pathname: path.join(__dirname, 'index.html'),

            protocol: 'file:',
            slashes: true
        }))

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
        bgWindow = null
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
    if (mainWindow === null) {
        createWindow()
    }
})

// communications
ipcMain.on('create-project', (e, project) => {
    
    bgWindow.webContents.send('create-project', project)
})

ipcMain.on('start-server', (e, id) => {

    bgWindow.webContents.send('start-server', id)
})

ipcMain.on('notify', (e, message) => {

    mainWindow.webContents.send('notify', message)
})