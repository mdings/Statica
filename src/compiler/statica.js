const path = require('upath')
const chokidar = require('chokidar')
const extensions  = require('./extensions')
const fileTypes  = require('require-dir')('./files')
const ignored = require('./ignored')
const {app} = require('electron').remote

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

        chokidar.watch(this.sourceDir, {ignored: ignored(this.sourceDir, this.targetDir)})
            .on('add', filename => this.createFile(path.normalize(filename)))
            .on('change', filename => this.change(filename))
            .on('ready', () => {

                console.log(this.files)
            })
    }

    createFile(filename) {

        const ext = path.extname(filename).toLowerCase().slice(1)
        const type = extensions[ext] || 'other'
        const file = new fileTypes[type](filename, this.sourceDir, this.targetDir)

        if(!hasUnderscore(filename)) {

            this.files.push(file)
        }
    }

    change(filename) {

        // Get the extension
        const ext = path.extname(filename).toLowerCase().slice(1)

        // Filter the files bases on their type
        var filtered = this.files.filter(file => {

            const info = file.fileInfo
            // Render only the 'masters' for the javascript and stylesheet
            if (extensions[ext] == 'javascript' ||
                extensions[ext] == 'stylesheet') {

                return file.type == extensions[ext]

            } else {

                return file.type == extensions[ext]
                    && `${info.sourceDir}/${info.sourceFile}` == filename
            }
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