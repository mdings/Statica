'use strict'

const fs = require('fs')
const path = require('path')
const pug = require('pug')
const mm = require('marky-mark')
const findUp = require('find-up')
const File = require('../file')

module.exports = class Page extends File {

    constructor(filepath, sourceDir, targetDir) {
        super(filepath, sourceDir, targetDir)
    }

    //@TODO: Look into node streams (.pipe())
    render(resolve, reject) {
        console.log(`rendering javascript: ${this.fileInfo.sourceFile}`)
        const sourcePath = `${this.fileInfo.sourceDir}/${this.fileInfo.sourceFile}`
        if(this.isMarkDown) {
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
            this.read()

            // Enable partials for regular HTML-files
            const output = this.input.replace(/\<\!-- @include (.*) --\>/g, (match, file) => {
                return fs.readFileSync(`${this.fileInfo.sourceDir}/${file}`);
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
        return this.fileInfo.extension == '.html'
            || this.fileInfo.extension == '.htm'
    }

    get isMarkDown() {
        return this.fileInfo.extension == '.md'
            || this.fileInfo.extension == '.markdown'
    }

    get isPug() {
        return this.fileInfo.extension == '.pug'
            || this.fileInfo.extension == '.jade'
    }
}