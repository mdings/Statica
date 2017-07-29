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

                    /* error object
                    {
                        message: "<info about the error>",
                        line: <line of the error>
                    }
                    */
                    const message = `<strong>${err.message}</strong><br>
                    <span class="line">Error at line ${err.line}</span>`
                    this.emit('error', message, path.parse(this.filename), err.line)

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

                    /* error object
                    {
                        name: "parseError",
                        message: <code and info about the error >
                    }
                    */
                    this.emit('error', err.message)

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

                    /* error object
                    {
                        column: 18
                        extract: array of lines,
                        filename,
                        line: 11,
                        message: message
                    }
                    */
                    console.log(err)

                } else {

                    this.process(output.css)
                }
            })
        }
    }

    process(css) {

        // Run postCSS, which does automatic prefixing
        postcss([

            require('postcss-cssnext')
        ])
        .process(css)
        .then(result => {

            this.write(result.css)
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