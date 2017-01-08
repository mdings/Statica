const {ipcRenderer} = require('electron')
const chokidar = require('chokidar')
const fs = require('fs')
const mkdirp = require('mkdirp')
const {app} = require('electron').remote
const utils = require('./utils')

let bs 

class Project {

    constructor(project) {

        this.id = project.id
        utils.setPath(project.path) // root of the folder we are watching
        utils.setBase(`${app.getPath('userData')}/temp/${this.id}`)
       
        // keep a reference to the master files
        this.files = {}
        this.files.css = []
        this.files.js = []

        // create the directories if they don't exist yet
        mkdirp(utils.getBase(), (e) => {

            if (e) throw new e

            bs = require('browser-sync').create(this.id);
            this.watch()
        })
    }

    watch() {

        const watcher = chokidar.watch(`${utils.getPath()}/**/*.{scss,sass,html,jade,pug,js,md}`, {

            ignored: /(((^|[\/\\])\..)|node_modules|bower_components|build)/
        })

        watcher.on('add', (file) => {

            console.log(`watcher add: ${file}`)

            const ext = file.split('.').pop()
            if (!utils.has_(file)) {

                // set references to 'master' css files
                if (ext == 'scss' || ext == 'sass') {

                    this.files.css.push(file)

                } else if (ext == 'js') {

                    this.files.js.push(file)
                }

                this.parse(file, ext)
            }
        })

        watcher.on('unlink', (file) => {
            
            console.log(`unlinking file: ${file}`)

            const ext = file.split('.').pop()
            // set references to 'master' css files
            if (ext == 'scss' || ext == 'css' || ext == 'sass') {

                this.files.css = this.files.css.filter((item) => {

                    return item != file
                })

            } else if (ext == 'js') {

                this.files.js = this.files.js.filter((item) => {

                    return item != file
                })
            }
        })

        watcher.on('change', (file) => {

            console.log(`watcher change: ${file}`)

            const ext = file.split('.').pop()
            this.parse(file, ext)
        })
    }

    start() {

        if(!bs.active) {

            bs.init({

                ui: false,
                notify: false,
                server: utils.getBase()
             });
        }
    }

    parse(file, ext) {

        const fn = (ext == 'js')
            ? 'js' : (ext == 'scss' || ext == 'sass')
                ? 'css' : (ext == 'jade' || ext == 'pug')
                    ? 'jade' : (ext == 'md')
                        ? 'markdown' : 'copy'


        if (fn) {

            this[fn].call(this, file)
        }
    }

    markdown(file) {

        require('./parsers/markdown')(file)
    }

    js() {

        // render the javascript
        if (this.files.js.length > 0) {

            const promises = []
            this.files.js.forEach((file) => {

                promises.push(require('./parsers/js')(file))
            })

            Promise.all(promises).then(() => {
                
                // only reload the browser when all the master js-files are compiled
                console.log(`reloading bs from js`)
                bs.reload(true)

            }).catch((error) => {

                console.log(error)
            })
        }
    }

    css() {

        // render the css
        if (this.files.css.length > 0) {

            const promises = []
            this.files.css.forEach((file) => {

                promises.push(require('./parsers/css')(file))
            })

            Promise.all(promises).then(() => {
                
                // only reload the browser when all the master css-files are compiled
                console.log(`reloading bs from css`)
                bs.reload(true)

            }).catch((error) => {

                console.log(error)
            })
        }
        
    }

    jade(file) {

        require('./parsers/jade')(file)   
    }

    copy(file) {

        const fileName = file.split('/').pop()
        fs.createReadStream(file)
            .pipe(fs.createWriteStream(`${utils.getBase()}/${fileName}`))

    }
}

module.exports = Project