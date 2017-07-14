const path = require('upath')
const chokidar = require('chokidar')
const extensions  = require('./extensions')
const fileTypes  = require('require-dir')('./files')
const ignored = require('./ignored')
const {app} = require('electron').remote
const {ipcRenderer} = require('electron')

const hasUnderscore = (filename) => {

    return path.parse(filename).base.charAt(0) == '_'
}


module.exports = class Compiler {

    constructor(project) {

        console.log('creating project')

        this.project = project
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

        const ext = path.extname(filename).toLowerCase()
        const type = extensions[ext] || 'other'
        const file = new fileTypes[type](filename, this.project)

        if(!hasUnderscore(filename)) {

            const project = this.project

            this.files.push(file)

            // Consolidate file errors to be able to pass them to the application
            file.on('error', (message, filename, line) => {

                // @deprecate this
                // Notify the UI of a status update
                // ipcRenderer.send('status-update', {

                //     status: 'error',
                //     project
                // })

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
        }
    }

    /**
     * Removes a file from the files array
     * @constructor
     * @param {string} filename - The name of the file
     */

    unlink(filename) {

        // console.log('ckokidar: remove', filename)

        this.files = this.files.filter(file => {

            return file.filename != filename
        })

    }

    /**
     * Checks if the root directory still exists when folders are being removed
     * @param {string} dirname - name of the directory
     */

    unlinkDir(dirname) {

        console.log('unlinking Dir', this.project.path, dirname)

        if (this.project.path == dirname) {

            // Send a message to the main process that a folder has been removed
            ipcRenderer.send('unlink-project', this.project)
        }
    }

    change(filename) {

        console.log('trigger change')

        const file = this.files.find(file => {

            return file.filename == filename
        })

        if (file) {

            // Notify the UI of a project being processed
            ipcRenderer.send('status-update', {

                status: 'processing',
                project: this.project
            })

            file.render()
        }
    }

    // launch() {

    //     this.render(this.files)

    //     if (!this.browsersync.active) {

    //         // const targetDir = `${app.getPath('userData')}/temp/${this.project.id}`

    //         this.browsersync.init({
    //             ui: false,
    //             notify: false,
    //             server: this.targetDir
    //         });
    //     }
    // }

    destroy() {

        this.watcher.close()
        delete this
    }
}