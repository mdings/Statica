'use strict'

const sass = require('node-sass')
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

            stylus.render(stream, (err, output) => {

                if (err) {

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
    }

    process(css) {

        // Run postCSS
        postcss([

            // require('postcss-cssnext')
        ])
        .process(css)
        .then(result => {

            this.write(result.css)
        })
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