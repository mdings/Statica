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
        // Keep a reference for collections to be set by the compiler
        this.collection = {}
    }

    //@TODO: Look into node streams (.pipe())
    render(resolve, reject) {
        if(this.isMarkDown) {
            const base = path.dirname(this.info.path)
            findUp(['_layout.pug'], {
                cwd: base
            })
            .then(filepath => {
                if (filepath) {
                    const data = mm.parseFileSync(this.info.path)
                    const output = this.puggify(filepath, data)
                    this.write(output, resolve)
                } else {
                    reject('No layout file found')
                }
            })
        } else if (this.isPug) {
            const data = this.collection.all
            const output = this.puggify(this.info.path, data)
            this.write(output, resolve)
        } else if (this.isHTML) {
            this.read()
            // Enable partials for regular HTML-files
            const output = this.input.replace(/\<\!-- @include (.*) --\>/g, (match, file) => {
                return fs.readFileSync(`${this.info.sourceDir}/${file}`);
            })
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
        return 'html'
    }

    get isHTML() {
        return this.info.ext == 'html'
            || this.info.ext == 'htm'
    }

    get isMarkDown() {
        return this.info.ext == 'md'
            || this.info.ext == 'markdown'
    }

    get isPug() {
        return this.info.ext == 'pug'
            || this.info.ext == 'jade'
    }
}