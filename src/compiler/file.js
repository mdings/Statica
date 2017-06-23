'use strict'

const fs = require('fs')
const util = require('util')
const mkdirp = require('mkdirp')
const path = require('upath')
const EventEmitter = require('events').EventEmitter

class File {

    constructor(filename, project) {

        this.project = project.path
        this.filename = filename

        // Check if the extensions are defined for filetypes
        if (typeof this.exportExtension != 'string') {

            throw Error(`There is no extension defined for ${this.constructor.name}`)
        }
    }

    read() {

        return fs.readFileSync(this.filename, 'utf8')
    }

    write(result) {

        // Ouput all the files to the 'build' folder
        const file = this.filename.replace(this.project, 'build')
        const paths = path.parse(file)
        const target = `${paths.dir}/${paths.name}${this.exportExtension}`
        const destination = `${this.project}/${target}`

        // Create the dir if it does not exist yet
        mkdirp.sync(path.dirname(destination))

        console.log('writing to: ', path.parse(destination).base)

        // And write the file..!
        fs.writeFile(destination, result, (err) => {

            if (err) {

                this.emit('error', err)

            } else {

                this.emit('success', {})
            }
        })
    }
}

util.inherits(File, EventEmitter)
module.exports = File

/*
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
*/