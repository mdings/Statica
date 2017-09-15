const {BrowserWindow, Tray} = require('electron')

module.exports = {

    create(name, options) {

        // Instantiate the actual window and load the URL
        const win = new BrowserWindow(options)

        win.loadURL(`file://${__dirname}/${name}.html`)

        // Open dev tools while developing
        if (process.env.NODE_ENV === 'development') {

            // win.openDevTools()
        }

        return win
    },

    toggle(win) {

        if (win.isVisible()) {

            win.hide()

        } else {

            this.show(win)
        }
    },

    show(win, active = true) {

        if (!active) {

            win.showInactive()

        } else {

            win.show()
        }

    },

    getPosition(win, tray) {

        const windowBounds = win.getBounds()
        const trayBounds = tray.getBounds()

        // Center window horizontally below the tray icon
        const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

        // Position window 4 pixels vertically below the tray icon
        const y = Math.round(trayBounds.y + trayBounds.height + 3)

        return {
            x, y
        }
    }
}