const path = require('upath')
const fs = require('fs')
const chokidar = require('chokidar')
const extensions = require('./extensions')
const fileTypes = require('require-dir')('./files')
const ignored = require('./ignored')
const electron = require('electron')
const { app, BrowserWindow } = electron.remote
const { ipcRenderer } = electron
const browsersync = require('browser-sync')
const utils = require('./utils')
const { exec } = require('child_process')

/**
 * Checks whether a folder or filename starts with an underscore
 * @param {string} filename
 * @returns {boolean}
 */
const hasUnderscore = filename => {
    let parts = filename.split('/')
    parts = parts.filter(part => part.charAt(0) == '_')
    return parts.length > 0 ? true : false
}

module.exports = class Compiler {

    constructor(project) {
        this.project = project
        this.ready = false // we're ready when all files have been indexed
        this.files = []

        this.watcher = chokidar.watch(project.path, {
            usePolling: true, // better for window
            ignored: ignored(`${project.path}/build/**/*`)
        })

        // This basically watches ALL the files within the folder (except for the ignored ones) but only has actions for some specifief filenames
        this.watcher
        .on('add', filename => this.add(path.normalize(filename)))
        .on('unlink', filename => this.unlink(path.normalize(filename)))
        .on('unlinkDir', dirname => this.unlinkDir(path.normalize(dirname)))
        .on('change', filename => this.change(filename))
        .on('ready', () => {
            // @TODO: create a separate window to do an initial rendering of ALL the files?
            this.ready = true
            ipcRenderer.send('statusUpdate', {
                status: 'ready',
                project
            })
        })
    }

    /**
     * Creates a new file class, adds it to the files array and renders the file immediately. Only takes in files that are so-called 'masters'
     * @constructor
     * @param {string} filename - The name of the file
     */

    add(filename) {
        if (!hasUnderscore(filename)) {
            const ext = path.extname(filename).toLowerCase()
            const type = extensions[ext]

            console.log(filename, type)
            const file = new fileTypes[type](filename, this.project)
            const project = this.project

            this.files.push(file)

            // If the file is added after initial indexing, then immediately render it.
            // If not, only copy the original images and other files
            if (this.ready) {
                file.render().catch(err => { })
            } else {
                if (file.constructor.name == 'Other'
                    || file.constructor.name == 'Image') {
                    file.render(false) // don't optimize yet, only copy
                }
            }
        }
    }

    /**
     * Optimizes all the project files in the build folder
     */
    async optimize() {
        const renderFiles = this.files.map(file => file.render(true))
        await Promise.all(renderFiles).catch(err => {
            // Fail silently
        })
    }

    /**
     * Removes a file from the files array
     * @constructor
     * @param {string} filename - The name of the file
     */

    unlink(filename) {
        this.files = this.files.filter(file => file.filename != filename)
        console.log('ckokidar: remove')
        console.log(this.files)
    }

    /**
     * Checks if the root directory still exists when folders are being removed
     * @param {string} dirname - name of the directory
     */

    unlinkDir(dirname) {
        console.log(this.project.path)
        if (!fs.existsSync(this.project.path)) {
            ipcRenderer.send('unlinkProject', this.project)
            console.log('unlinking dir')
        }
    }

    change(filename) {
        if (!this.ready) return

        let filesToRender
        const parseFile = path.parse(filename)

        // First see if we're changing a layout file. If so, then render all markdown files for that directory
        if (parseFile.name == '_layout') {
            filesToRender = this.files.filter(file => {
                return path.parse(file.filename).ext == '.md'
                    && file.filename.startsWith(parseFile.dir)
            })

            // If not, then check if we need to render other 'master' files which are no layout files
        } else if (hasUnderscore(filename)) {
            const ext = path.parse(filename).ext
            filesToRender = this.files.filter(file => {
                // When we are compiling Vue, we only want to trigger master files that have the extension .js, otherwise also .ts and .coffee will recompile. Savvy?
                if (parseFile.ext == '.vue') {
                    // javascript == javascript
                    return extensions[ext].toLowerCase() == file.constructor.name.toLowerCase()
                        && path.parse(file.filename).ext == '.js'
                        && parseFile.name != '_layout'
                } else {
                    // .less == .less
                    return parseFile.ext == path.parse(file.filename).ext
                        && parseFile.name != '_layout'
                }
            })
            // Otherwise render the file, typically only one
        } else {
            filesToRender = this.files.filter(file => file.filename == filename)
        }

        if (filesToRender.length) {
            // Notify the UI of a project being processed
            ipcRenderer.send('statusUpdate', {
                status: 'processing',
                project: this.project
            })

            filesToRender = filesToRender.map(file => file.render())

            Promise
            .all(filesToRender)
            .then(() => {
                ipcRenderer.send('statusUpdate', {
                    status: 'success',
                    project: this.project
                })
            }, err => {
                console.log('from statica.js', err)
                try {
                    const { message, line, filename } = err
                    const subtitle = line
                        ? `Error on line ${line} of ${path.parse(filename).base}`
                        : `Error in ${path.parse(filename).base}`

                    utils.notify(
                        `Failed to compile ${this.project.name}`,
                        subtitle,
                        message
                    )
                } catch (err) {
                    console.log(err)
                }

                // @todo: should be error
                ipcRenderer.send('statusUpdate', {
                    status: 'success',
                    project: this.project
                })
            })
        }
    }

    launch() {
        const bs = browsersync.create()
        bs.init({
            ui: false,
            notify: false,
            logLevel: 'silent',
            ghostMode: false,
            cors: true,
            minify: false,
            server: `${this.project.path}/build/`,
            files: `${this.project.path}/build/**/*`
        })
    }

    destroy() {
        this.watcher.close()
        delete this
    }
}