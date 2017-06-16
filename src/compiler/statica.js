const path = require('upath')
const chokidar = require('chokidar')
const extensions  = require('./extensions')
const fileTypes  = require('require-dir')('./files')
const ignored = require('./ignored')
const {app} = require('electron').remote
const {ipcRenderer} = require('electron')

function hasUnderscore(filename) {

    const parts = path.normalize(filename).split('/')
    const scores = parts.filter(part => {

        return part.charAt(0) == '_'
    })

    return scores.length > 0 ? true : false
}

module.exports = class Compiler {

    constructor(project) {

        // Set project properties
        this.files = []
        this.project = project
        this.browsersync = require('browser-sync').create(project.id);
        this.sourceDir = project.path
        // this.targetDir = `${app.getPath('userData')}/temp/${project.id}`
        this.targetDir = `${this.sourceDir}/build`

        this.watcher = chokidar.watch(this.sourceDir, {ignored: ignored(this.sourceDir, this.targetDir)})
            .on('add', filename => this.createFile(path.normalize(filename)))
            .on('unlink', filename => this.removeFile(path.normalize(filename)))
            .on('unlinkDir', dirname => this.checkDir(path.normalize(dirname)))
            .on('change', filename => this.change(filename))
            .on('ready', () => {

                console.log(this.watcher.getWatched())
                // console.log(this.files)
            })
    }

    /**
     * Creates a new file class, adds it to the files array and renders the file immediately
     * @constructor
     * @param {string} filename - The name of the file
     */

    createFile(filename) {

        console.log('ckokidar: add')

        const ext = path.extname(filename).toLowerCase()
        const type = extensions[ext] || 'other'
        const file = new fileTypes[type](filename, this.sourceDir, this.targetDir)

        if(!hasUnderscore(filename)) {

            this.files.push(file)
        }
    }

    /**
     * Removes a file from the files array
     * @constructor
     * @param {string} filename - The name of the file
     */

    removeFile(filename) {

        console.log('ckokidar: remove')

        this.files = this.files.filter(file => {

            const sourceFile = `${file.fileInfo.dir}/${file.fileInfo.base}`
            return sourceFile != filename
        })

    }

    /**
     * Checks if the root directory still exists when folders are being removed
     * @param {string} dirname - name of the directory
     */

    checkDir(dirname) {

        if (this.project.path == dirname) {

            console.log('ok unlinking dir')
            // Send a message to the main process that a folder has been removed
            ipcRenderer.send('unlink-project', this.project)
        }
    }

    change(filename) {

        console.log('ckokidar: change', filename)

        const filtered = this.files.filter(file => {

            const sourceFile = `${file.fileInfo.dir}/${file.fileInfo.base}`
            return sourceFile == filename
        })

        this.render(filtered)
    }

    launch() {

        this.render(this.files)

        if (!this.browsersync.active) {

            // const targetDir = `${app.getPath('userData')}/temp/${this.project.id}`

            this.browsersync.init({
                ui: false,
                notify: false,
                server: this.targetDir
            });
        }
    }

    destroy() {

        this.watcher.close()
        delete this
    }

    render(files) {

        // Create a batch to process
        let batch = []

        // Push the files to the batch
        files.forEach(file => {

            batch.push(file.promise())
        })

        // Render the batch
        Promise.all(batch).then(() => {

            console.log('all done for: ' + this.project.id)

        }).catch(error => {

            console.log(error)
        })
    }
}