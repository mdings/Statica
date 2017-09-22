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

    sass() {

        return new Promise((resolve, reject) => {

            sass.render({

                file: this.filename,
                options : {

                    includePaths: [this.project]
                }

            }, (err, result) => {

                if (err) {

                    const message = err.message
                    const line = err.line
                    return reject({message, line})
                }

                resolve(result.css.toString('utf8'))
            })
        })
    }

    stylus() {

        return new Promise((resolve, reject) => {

            const stream = this.read()

            stylus.render(stream, (err, output) => {

                if (err) {

                    // Strips the code that is provided because that can get larger than the actual column width available
                    const split = err.message.split(/\r?\n/)
                    const line = err.message.match(/\d+/) //gets the first digit which is line
                    const message = `${split.slice(-2, -1)}`
                    return reject({message, line})
                }

                resolve(output)
            })
        })
    }

    less() {

        return new Promise((resolve, reject) => {

            const stream = this.read()

            less.render(stream, {

                filename: this.filename
            }, (err, output) => {

                if (err) {

                    const message = err.message
                    const line = err.line
                    return reject({message, line})
                }

                resolve(output.css)
            })
        })
    }

    async render(isProduction = false) {

        // Set the production flag
        this.isProduction = isProduction

        let toRender

        if (this.isSass) {

            toRender = 'sass'
        }

        if (this.isStylus) {

            toRender = 'stylus'
        }

        if (this.isLess) {

            toRender = 'less'
        }

        // If the file is regular css don't run it through a preprocessor, otherwise run the preprocessor as specified
        if (this.isCss) {

            const stream = this.read()
            const data = await this.process(stream)
            this.write(data)

        } else {

            try {

                let data
                data = await this[toRender].call(this)
                data = await this.process(data)
                this.write(data)

            } catch (e) {

                // Only display errors when we're not optimizing
                if (!this.isProduction) {

                    this.emit('error', e.message, e.line, path.parse(this.filename))
                }
            }
        }
    }

    process(css) {

        return new Promise((resolve, reject) => {

            // Run postCSS, which also does automatic prefixing
            postcss([

                require('postcss-cssnext'),
                require('postcss-csso')({
                    comments: false, // Remove comments
                })
            ])
            .process(css)
            .then(result => {

                resolve(result.css)

            }).catch(err => {

                reject(err)
            })
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