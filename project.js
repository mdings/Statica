const chokidar = require('chokidar')
const browserify = require('browserify')
const postcss = require('postcss')
const sass = require('node-sass')
const fs = require('fs')
const mkdirp = require('mkdirp')
const {app} = require('electron').remote
const pug = require('pug')

const has_ = (file) => {

    const parts = file.split('/')
    const l = parts.find((part) => {

        return part.charAt(0) == '_'
    })

    return l ? true : false
}

class Project {

    constructor(project) {

        this.id = project.id
        this.path = project.path  // root of the folder we are watching
        this.base = `${app.getPath('userData')}/temp/${this.id}`

        this.files = {}
        this.files.css = []
        this.files.js = []

        // create the directories if they don't exist yet
        mkdirp(this.base, (e) => {

            if (e) throw new e

            this.bs = require('browser-sync').create(this.id);
            this.watch()
        })
    }

    getPathInfo(file, ext) {

        const extension = file.split('.').pop()
        let outFile = file.replace(this.path, this.base)
        outFile = outFile.replace(extension, ext)
        const inDir = file.split('/').slice(0, -1).join('/')
        const inFile = file
        const outDir = outFile.split('/').slice(0, -1).join('/')


        return {

            inDir,
            inFile,
            outDir,
            outFile
        }
    }

    watch() {

        // @TODO: ignore dot files, node_modules and bower_components
        const watcher = chokidar.watch(this.path, {

            ignored: /(((^|[\/\\])\..)|node_module|bower_components)/,
            persistent: true
        })

        watcher.on('add', (file) => {

            console.log(`watcher add: ${file}`)

            const ext = file.split('.').pop()
            if (!has_(file)) {

                // set references to 'master' css files
                if (ext == 'scss' || ext == 'css' || ext == 'sass') {

                    this.files.css.push(file)

                } else if (ext == 'js') {

                    this.files.js.push(file)
                }

                this.parse(file, ext)
            }
        })

        watcher.on('unlink', (file) => {

            watcher.on('unlink', (file) => {

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
        })

        watcher.on('change', (file) => {

            console.log(`watcher change: ${file}`)

            const ext = file.split('.').pop()
            this.parse(file, ext)
        })
    }

    start() {

        if(!this.bs.active) {

            this.bs.init({
                server: this.base
             });

             console.log(this.bs)

        }
    }

    parse(file, ext) {

        const fn = (ext == 'js')
            ? 'js' : (ext == 'scss' || ext == 'css')
                ? 'css' : (ext == 'jade' || ext == 'html' || ext == 'pug')
                    ? 'jade' : 'copy'


        if (fn) {

            this[fn].call(this, file)
        }
    }

    js(file) {

        // Render the javascript
        this.files.js.forEach((jsFile) => {

            const paths = this.getPathInfo(file, 'js')

            console.log(`compiling js:${jsFile}`)

            browserify(jsFile)
            .transform('babelify', {

                // The preset should be loaded from the electron directories,
                // not from the project ones
                presets: [`${__dirname}/node_modules/babel-preset-es2015`]
            })
            .bundle((e, result) => {

                if(e) {

                    this.mainWindow.webContents.send('notify', e.message)

                } else {

                    mkdirp(paths.outDir, (e) => {

                        if (e) throw new e

                        fs.writeFileSync(paths.outFile, result, 'utf-8')
                        this.bs.reload(true)
                    })
                }
            })
        })
    }

    css(file) {

        // Render the css
        this.files.css.forEach((cssFile) => {

            console.log(`compiling css:${cssFile}`)

            const data = fs.readFileSync(cssFile, 'utf-8')
            const paths = this.getPathInfo(cssFile, 'css')

            const result = sass.render({

                outFile: paths.outFile, // does NOT also write to file
                sourceMap: true,
                includePaths: [paths.inDir],
                data: data,
                outputStyle: 'compressed'

            }, (e, result) => {

                if (e) {

                    this.mainWindow.webContents.send('notify', e.message)

                } else {

                    postcss([require('autoprefixer')])
                    .process(result.css)
                    .then(output => {

                        // write the outpout to file
                        mkdirp(paths.outDir, (e) => {

                            if (e) throw new e

                            fs.writeFileSync(paths.outFile, output.css, 'utf-8')
                            this.bs.reload(true)
                        })
                    });
                }
            })
        })
    }

    jade(file) {

        // Render html
        const compiledFunction = pug.compileFile(file)
        const result = compiledFunction()
        const paths = this.getPathInfo(file, 'html')

        mkdirp(paths.outDir, (e) => {

            if (e) throw new e

            fs.writeFile(paths.outFile, result, 'utf-8')

        })
    }

    copy(file) {

        const fileName = file.split('/').pop()
        fs.createReadStream(file)
            .pipe(fs.createWriteStream(`${this.base}/${fileName}`))

    }
}

module.exports = Project