'use strict'

const sass = require('node-sass')
const postcss = require('postcss')
const path = require('upath')
const File = require('../file')

module.exports = class Stylesheet extends File {

    constructor(filepath, sourceDir, targetDir) {
        super(filepath, sourceDir, targetDir)
    }

    render(resolve, reject) {
        // First read the contents of the file
        this.read()
        // Render CSS
        if (this.isSass) {
            var output = sass
            .renderSync({
                data: this.input,
                includePaths: [path.dirname(this.info.path)]
            })
            .css
            .toString('utf8')
        }

        // Run postCSS
        postcss([
            require('autoprefixer')
        ])
        .process(output)
        .then(result => {
            this.write(result.css, resolve)
        })
    }

    get exportExtension() {
        return 'css'
    }

    get isSass() {
        return this.info.ext == 'scss'
    }
}