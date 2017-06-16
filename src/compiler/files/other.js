'use strict'

const File = require('../file')

module.exports = class Other extends File {

    constructor(filepath, sourceDir, targetDir) {

        super(filepath, sourceDir, targetDir)
    }

    render() {

        console.log(`copying other: ${this.fileInfo.sourceFile}`)
        this.copy()
    }

    get exportExtension() {

        // Keep the same extension
        return this.fileInfo.ext
    }
}