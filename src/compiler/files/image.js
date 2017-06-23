'use strict'

const File = require('../file')
const path = require('upath')

module.exports = class Image extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    render() {

        console.log(`copying image: ${this.fileInfo.sourceFile}`)
        this.copy()
    }

    get exportExtension() {

        // Keep the same extension
        return path.parse(this.filename).ext
    }
}