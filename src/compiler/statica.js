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
const notifier = require('node-notifier')

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

                // @TODO: create a separate window to do an initial rendering of ALL the files?
                this.ready = true
                ipcRenderer.send('project-ready', project)
                ipcRenderer.send('status-update', {

                    status: 'ready',
                    project
                })
            })
    }

    /**
     * Creates a new file class, adds it to the files array and renders the file immediately
     * @constructor
     * @param {string} filename - The name of the file
     */

    add(filename) {

        if(!hasUnderscore(filename)) {

            const ext = path.extname(filename).toLowerCase()
            const type = extensions[ext] || 'other'
            const file = new fileTypes[type](filename, this.project)
            const project = this.project

            // Add the file to the existing array
            this.files.push(file)

            // Consolidate file errors to be able to pass them to the application
            file.on('error', (message, line, filename) => {

                notifier.notify({

                    title: `Failed to compile ${project.name}`,
                    subtitle: `Error on line ${line} of ${filename.base}`,
                    message: message,
                    group: 'statica', // only display one notification per app
                    sound: 'Purr',
                    timeout: 10000,
                });
            })

            file.on('notification', (warning, filename) => {

                notifier.notify({

                    title: `Warning for ${project.name}`,
                    subtitle: `${filename.base}`,
                    message: warning,
                    group: 'statica', // only display one notification per app
                    sound: 'Purr',
                    timeout: 10000,
                });
            })

            if (this.ready) {

                // @TODO: there are no visual updates for this atm. See how we can improve?
                // Immediately render the files when added..
                file.render()
            }
        }
    }

    /**
     * Optimizes all the project files in the build folder
     */
    async optimize() {

        const renderFiles = this.files.map(file => file.render(true))
        await Promise.all(renderFiles)
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

            filesToRender = filesToRender.map(file => file.render(true))

            Promise.all(filesToRender).then(() => {

                ipcRenderer.send('status-update', {

                    status: 'success',
                    project: this.project
                })
            })
        }
    }

    launch() {

        browsersync.create().init({
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