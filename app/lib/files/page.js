'use strict'

const fs = require('fs')
const pug = require('pug')
const File = require('../file')

module.exports = class Page extends File {

    constructor(filepath, sourceDir, targetDir) {
        super(filepath, sourceDir, targetDir)
    }

    //@TODO: Look into node streams (.pipe())
    render(resolve, reject) {
        if(this.isPug) {
            const compiled = pug.compileFile(this.info.path)
            this.write(compiled(), resolve)
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

    get exportExtension() {
        return 'html'
    }

    get isHTML() {
        return this.info.ext == 'html'
            || this.info.ext == 'htm'
    }

    get isPug() {
        return this.info.ext == 'pug'
            || this.info.ext == 'jade'
    }
}