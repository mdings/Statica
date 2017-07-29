'use strict'

const fs = require('fs')
const path = require('path')
const pug = require('pug')
const mm = require('marky-mark')
const findUp = require('find-up')
const File = require('../file')

module.exports = class Page extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    //@TODO: Look into node streams (.pipe())

    render(resolve, reject) {

        const sourcePath = this.filename

        if (this.isMarkDown) {

            // Find the closest layout file
            findUp(['_layout.pug'], {
                cwd: this.fileInfo.sourceDir
            })
            .then(filepath => {
                if (filepath) {
                    const data = mm.parseFileSync(sourcePath)
                    const output = this.puggify(filepath, data)
                    this.write(output, resolve)
                } else {
                    reject('No layout file found')
                }
            })

        } else if (this.isPug) {

            const output = this.puggify(sourcePath, data)
            this.write(output, resolve)

        } else if (this.isHTML) {

            const input = this.read()

            // Enable partials for regular HTML-files
            const output = input.replace(/\<\!-- @include (.*) --\>/g, (match, file) => {

                return fs.readFileSync(`${this.project}/${file}`);
            })

            // Writeout
            this.write(output, resolve)

        } else {
            // Just copy the file when it's other than Pug
            this.read()
            this.write(this.input, resolve)
        }
    }

    puggify(file, data) {
        const compiled = pug.compileFile(file)
        return compiled(data)
    }

    get exportExtension() {

        return '.html'
    }

    get isHTML() {
        return path.parse(this.filename).ext == '.html'
            || path.parse(this.filename).ext == '.htm'
    }

    get isMarkDown() {
        return path.parse(this.filename).ext == '.md'
            || path.parse(this.filename).ext == '.markdown'
    }

    get isPug() {
        return path.parse(this.filename).ext == '.pug'
            || path.parse(this.filename).ext == '.jade'
    }
}