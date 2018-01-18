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
                    includePaths: [this.project.path]
                }
            }, (err, result) => {
                if (err) return reject(err)
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

                    err.message = message
                    err.line = line
                    reject(err)
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
                if (err) reject(err)
                resolve(output.css)
            })
        })
    }

    async render() {
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
        try {
            if (this.isCss) {
                const stream = this.read()
                const data = await this.process(stream)
                await this.write(data)
            } else {
                let data
                data = await this[toRender].call(this)
                data = await this.process(data)
                await this.write(data)
            }
        } catch (err) {
            throw this.error(err)
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
            || path.parse(this.filename).ext == '.stylus'
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