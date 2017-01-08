'use strict'

const pug = require('pug')
const File = require('../file')

module.exports = class Page extends File {
    
    constructor(filepath, sourceDir, targetDir) {
        super(filepath, sourceDir, targetDir)
    }

    render(resolve, reject) {
        if(this.isPug) {
            const compiled = pug.compileFile(this.info.path)
            this.write(compiled(), resolve)
        } else {
            // Just copy the file when it's other than Pug
            this.read()
            this.write(this.input, resolve)
        }
    }
    
    get exportExtension() {
        return 'html'
    }

    get isPug() {
        return this.info.ext == 'pug'
            || this.info.ext == 'jade'
    }
}