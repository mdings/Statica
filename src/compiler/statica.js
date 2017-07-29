const path = require('upath')
const fs = require('fs')
const chokidar = require('chokidar')
const extensions  = require('./extensions')
const fileTypes  = require('require-dir')('./files')
const ignored = require('./ignored')
const electron = require('electron')
const {app, BrowserWindow} = electron.remote
const {ipcRenderer} = electron
const browsersync = require('browser-sync')

/**
 * Checks whether a folder or filename starts with an underscore
 * @param {string} filename
 * @returns {boolean}
 */
const hasUnderscore = (filename) => {

    let parts = filename.split('/')
    parts = parts.filter(part => {

        return part.charAt(0) == '_'
    })

    return parts.length > 0 ? true : false
}


module.exports = class Compiler {

    constructor(project) {

        this.project = project
        this.ready = false // we're ready when all files have been indexed
        this.files = []

        this.watcher = chokidar.watch(project.path, {

            ignored: ignored(`${project.path}/build/**/*`)
        })

        this.watcher
            .on('add', filename => this.add(path.normalize(filename)))
            .on('unlink', filename => this.unlink(path.normalize(filename)))
            .on('unlinkDir', dirname => this.unlinkDir(path.normalize(dirname)))
            .on('change', filename => this.change(filename))
            .on('ready', () => {

                this.ready = true

                // @todo: open a new background window and to background compilation in a separate window
                // 1. Open background window with remote
                // 2. On page-ready event pass the files to that window
                // 3. Render all files and have them return a promise
                // 4. When done (either successful or not) close the window again

                console.log('project ready')
                console.log(this.files)
            })
    }

    /**
     * Creates a new file class, adds it to the files array and renders the file immediately
     * @constructor
     * @param {string} filename - The name of the file
     */

    add(filename) {

        console.log(hasUnderscore(filename))

        if(!hasUnderscore(filename)) {

            console.log(filename + 'has no underscroe')
            const ext = path.extname(filename).toLowerCase()
            const type = extensions[ext] || 'other'
            const file = new fileTypes[type](filename, this.project)
            const project = this.project

            this.files.push(file)

            // Consolidate file errors to be able to pass them to the application
            file.on('error', (message, filename, line) => {

                ipcRenderer.send('project-error', {

                    project,
                    message,
                    filename,
                    line
                })
            })

            file.on('success', e => {

                // Notify the UI of a status update
                setTimeout(() => {

                    ipcRenderer.send('status-update', {

                        status: 'success',
                        project
                    })
                }, 500)
            })

            if (this.ready) {

                // Immediately render the files when added..
                file.render()
            }
        }

        console.log('ckokidar: add')
        console.log(this.files)
    }

    /**
     * Removes a file from the files array
     * @constructor
     * @param {string} filename - The name of the file
     */

    unlink(filename) {

        this.files = this.files.filter(file => {

            return file.filename != filename
        })

        console.log('ckokidar: remove')
        console.log(this.files)

    }

    /**
     * Checks if the root directory still exists when folders are being removed
     * @param {string} dirname - name of the directory
     */

    unlinkDir(dirname) {

        if (!fs.existsSync(this.project.path)) {

            ipcRenderer.send('unlink-project', this.project)
        }
    }

    change(filename) {

        if (!this.ready) return

        let filesToRender

        // We're triggering a change to a partial here, so we should render all masters for that file
        if (hasUnderscore(filename)) {

            const ext = path.parse(filename).ext

            filesToRender = this.files.filter(file => {

                return path.parse(file.filename).ext == ext
            })

        } else {

            filesToRender = this.files.filter(file => {

                return file.filename == filename
            })
        }

        if (filesToRender.length) {

            // Notify the UI of a project being processed
            ipcRenderer.send('status-update', {

                status: 'processing',
                project: this.project
            })

            filesToRender.forEach(file => file.render())
        }
    }

    launch() {

        browsersync.init({
            ui: false,
            notify: false,
            server: `${this.project.path}/build/`,
            files: `${this.project.path}/build/**/*`
        });
    }

    destroy() {

        this.watcher.close()
        delete this
    }
}