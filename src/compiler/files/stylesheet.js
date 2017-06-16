'use strict'

const sass = require('node-sass')
const stylus = require('stylus')
const postcss = require('postcss')
const path = require('upath')
const File = require('../file')

module.exports = class Stylesheet extends File {

    constructor(filepath, sourceDir, targetDir) {

        super(filepath, sourceDir, targetDir)
    }

    render(resolve, reject) {
        console.log(`rendering stylesheet: ${this.fileInfo.base}`)
        this.resolve = resolve
        this.reject = reject

        // First read the contents of the file
        this.read()

        // If the files is SASS
        if (this.isSass) {
            const output = sass
                .renderSync({
                    data: this.input,
                    includePaths: [this.fileInfo.dir]
                }).css.toString('utf8')

            this.process(output)
        }

        // If the file is Stylus
        if (this.isStylus) {
            stylus.render(this.input, (e, output) => {
                if (e) this.reject(e)
                this.process(output)
            });
        }
    }

    process(css) {
        // Run postCSS
        postcss([
            require('postcss-cssnext')
        ])
        .process(css)
        .then(result => {
            this.write(result.css, this.resolve)
        })
    }

    get exportExtension() {

        return '.css'
    }

    get isStylus() {
        return this.fileInfo.ext == '.styl'
    }

    get isSass() {
        return this.fileInfo.ext == '.scss'
    }
}