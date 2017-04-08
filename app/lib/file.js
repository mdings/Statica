'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('upath')

module.exports = class File {

    constructor(filename, sourceDir, targetDir) {

        // Set some fileInfo
        const baseName = path.basename(filename)
        const extension = path.extname(baseName).slice(1)
        const dirName = path.dirname(filename)

        this.fileInfo = {
            extension: extension,
            sourceFile: baseName,
            sourceDir: dirName,
            targetDir: `${targetDir}${dirName.replace(sourceDir, '')}`,
        }

        this.fileInfo.targetFile = baseName.replace(extension, this.exportExtension)
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
        const sourcePath = `${this.fileInfo.sourceDir}/${this.fileInfo.sourceFile}`
        this.input = fs.readFileSync(sourcePath, 'utf8')
    }

    copy() {
        const sourcePath = `${this.fileInfo.sourceDir}/${this.fileInfo.sourceFile}`
        const targetPath = `${this.fileInfo.targetDir}/${this.fileInfo.targetFile}`

        // Create the dir if it does not exist yet
        mkdirp.sync(path.dirname(this.fileInfo.targetDir))
        const inFile = fs.createReadStream(sourcePath)
        const outFile = fs.createWriteStream(targetPath);

        // Do the actual copying
        inFile.pipe(outFile);
    }

    write(output, cb) {
        const targetPath = `${this.fileInfo.targetDir}/${this.fileInfo.targetFile}`

        // Create the dir if it does not exist yet
        mkdirp.sync(path.dirname(targetPath))

        // And write the file..!
        fs.writeFile(targetPath, output, (e) => {
            if (e) throw e
            if (cb) cb()
        })
    }
}