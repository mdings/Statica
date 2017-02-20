const path = require('upath')
const statica = require('./statica')
const {app} = require('electron').remote

var bs

module.exports = class Compiler {

    constructor(project) {
        this.project = project
        this.start()
    }

    start() {
        const sourceDir = this.project.path
        const targetDir = `${app.getPath('userData')}/temp/${this.project.id}`

        console.log(targetDir)
        
        statica(sourceDir, targetDir)
            .on('started', () => {
                // Instantiate a browsersync instance
                bs = require('browser-sync').create(this.project.id);
            })
            .on('dir-add', dirname => {
                // collections.set(dirname, sourceDir)
            })
            .on('file-add', file => {
                // Pass a reference of the collections to the file if it needs them
                if (file.collection) {
                    file.collection = this.collection
                }
            })
            .on('render-type', files => {
                // Render files
                this.render(files)
                // Reload the browser if activated
                if (bs.active) {
                    bs.reload(true)
                }
            })
            .on('render-all', files => {
                this.render(files)
            })
    }

    open() {
        if(!bs.active) {
            const targetDir = `${app.getPath('userData')}/temp/${this.project.id}`
            bs.init({
                ui: false,
                notify: false,
                server: targetDir
            });
        }
    }

    render(files) {
        // Create a batch to process
        const batch = []
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