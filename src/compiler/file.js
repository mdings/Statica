'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('upath')

module.exports = class File {

    constructor(filename, sourceDir, targetDir) {

        // Set some fileInfo from path
        this.fileInfo = path.parse(filename)

        // Extend it with target info
        this.fileInfo.target = {}
        this.fileInfo.target.dir = this.fileInfo.dir.replace(sourceDir, targetDir)
        this.fileInfo.target.ext = this.exportExtension

        // The type is the name of the constructor, for example: "stylesheet"
        this.type = this.constructor.name.toLowerCase()

        // Check if the extensions are defined for filetypes
        if (typeof this.exportExtension != 'string') {

            throw Error(`There is no extension defined for ${this.constructor.name}`)
        }
    }

    promise() {

        return new Promise((resolve, reject) => {

            this.render(resolve, reject)
        })
    }

    read() {

        const sourcePath = `${this.fileInfo.dir}/${this.fileInfo.base}`
        this.input = fs.readFileSync(sourcePath, 'utf8')
    }

    copy() {

        const sourcePath = `${this.fileInfo.dir}/${this.fileInfo.base}`
        const targetPath = `${this.fileInfo.targetDir}/${this.fileInfo.name}/${this.fileInfo.target.ext}`

        // Create the dir if it does not exist yet
        mkdirp.sync(path.dirname(this.fileInfo.targetDir))
        const inFile = fs.createReadStream(sourcePath)
        const outFile = fs.createWriteStream(targetPath);

        // Do the actual copying
        inFile.pipe(outFile);
    }

    write(output, cb) {


        const targetPath = `${this.fileInfo.target.dir}/${this.fileInfo.base}`

        console.log('writing to', targetPath)
        // Create the dir if it does not exist yet
        mkdirp.sync(path.dirname(targetPath))

        // And write the file..!
        fs.writeFile(targetPath, output, (e) => {
            if (e) throw e
            if (cb) cb()
        })
    }
}