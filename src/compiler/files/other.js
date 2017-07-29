'use strict'

const File = require('../file')
const path = require('upath')

module.exports = class Other extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    render() {

        this.copy()
    }

    get exportExtension() {

        // Keep the same extension
        return path.parse(this.filename).ext
    }
}