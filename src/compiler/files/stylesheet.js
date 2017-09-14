'use strict'

const sass = require('node-sass')
const less = require('less')
const stylus = require('stylus')
const postcss = require('postcss')
const path = require('upath')
const File = require('../file')

module.exports = class Stylesheet extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    render() {

        const stream = this.read()

        // If the files is SASS
        if (this.isSass) {

            sass.render({

                file: this.filename,
                options : {

                    includePaths: [this.project]
                }

            }, (err, result) => {

                if (err) {

                    const message = err.message
                    const line = err.line
                    this.emit('error', message, line, path.parse(this.filename))

                } else {

                    this.process(result.css.toString('utf8'))
                }
            })
        }

        // If the file is Stylus
        if (this.isStylus) {

            console.log('rendering stylus')
            stylus.render(stream, (err, output) => {

                if (err) {

                    // Strips the code that is provided because that can get larger than the actual column width available
                    const split = err.message.split(/\r?\n/)
                    const line = err.message.match(/\d+/) //gets the first digit which is line
                    const message = `${split.slice(-2, -1)}`
                    this.emit('error', message, line, path.parse(this.filename))


                } else {

                    this.process(output)
                }
            })
        }

        // If the file is regular css
        if (this.isCss) {

            this.process(stream)
        }

        if (this.isLess) {

            less.render(stream, {

                filename: this.filename
            }, (err, output) => {

                if (err) {

                    const message = err.message
                    const line = err.line
                    this.emit('error', message, line, path.parse(this.filename))

                } else {

                    this.process(output.css)
                }
            })
        }
    }

    process(css) {

        // Run postCSS, which also does automatic prefixing
        postcss([

            require('postcss-cssnext')
        ])
        .process(css)
        .then(result => {

            this.write(result.css)
        }).catch(err => {

            // do nothing, most errors are likely to already have been caught by the preprocessor
            return
        })
    }

    get isLess() {

        return path.parse(this.filename).ext == '.less'
    }

    get isStylus() {

        return path.parse(this.filename).ext == '.styl'
    }

    get isCss() {

        return path.parse(this.filename).ext == '.css'
    }

    get isSass() {

        return path.parse(this.filename).ext == '.scss'
    }

    get exportExtension() {

        return '.css'
    }
}