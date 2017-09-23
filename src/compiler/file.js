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

    copy() {

        const file = this.filename.replace(this.project, 'build')
        const paths = path.parse(file)
        const target = `${paths.dir}/${paths.name}${this.exportExtension}`
        const destination = `${this.project}/${target}`

        // Create the dir if it does not exist yet
        mkdirp.sync(path.dirname(destination))
        const inFile = fs.createReadStream(this.filename)
        const outFile = fs.createWriteStream(destination);

        // // Do the actual copying
        inFile.pipe(outFile);
    }

    write(result) {

        // Ouput all the files to the 'build' folder
        const file = this.filename.replace(this.project, 'build')
        const paths = path.parse(file)
        const target = `${paths.dir}/${paths.name}${this.exportExtension}`
        const destination = `${this.project}/${target}`

        return new Promise((resolve, reject) => {

            console.log('writing to: ', path.parse(destination).base)

            // Create the dir if it does not exist yet
            mkdirp.sync(path.dirname(destination))

            // And write the file..!
            fs.writeFile(destination, result, err => {

                if (err) {

                    throw err
                    return
                }

                resolve()
            })
        })
    }
}

util.inherits(File, EventEmitter)
module.exports = File
