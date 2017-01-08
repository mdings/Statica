'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('upath')

module.exports = class File {

    constructor(filename, sourceDir, targetDir) {

        const ext = 
            path.extname(path.basename(filename))
            .toLowerCase()
            .slice(1)

        // Set some fileinfo
        this.info = {

            ext,
            sourceDir,
            targetDir,
            path: filename,
            target: (() => {

                const name = filename.replace(sourceDir, '')
                return `${targetDir}${name.replace(ext, this.exportExtension)}`
            })()
        }

        this.type = this.constructor.name.toLowerCase()
    }

     promise() {

        return new Promise((resolve, reject) => {

            this.render(resolve, reject)
        })
    }

    read() {

        this.input = fs.readFileSync(this.info.path, 'utf8')
    }

    write(output, cb) {

        // Create the dir if it does not exist yet
        mkdirp.sync(path.dirname(this.info.target))

        // And write the file..!
        fs.writeFile(this.info.target, output, (e) => {

            if (e) throw e
            if (cb) cb()
        })
    }
}