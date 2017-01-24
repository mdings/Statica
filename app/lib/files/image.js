'use strict'

const File = require('../file')

module.exports = class Image extends File {

    constructor(filepath, sourceDir, targetDir) {
        super(filepath, sourceDir, targetDir)
    }

    render() {
        console.log(`copying image: ${this.info.path}`)
        this.copy()
    }

    get exportExtension() {
        // Keep the same extension
        return this.ext
    }
}