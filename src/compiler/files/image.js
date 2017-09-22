'use strict'

const File = require('../file')
const path = require('upath')
const fs = require('fs')
const util = require('util')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')

module.exports = class Image extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    optimize(destination) {

        return imagemin([this.filename], destination, {

            plugins: [
                imageminJpegtran(),
                imageminPngquant({
                    quality: '65-80'
                })
            ]
        })
    }

    rename(oldPath, newPath) {

        return new Promise((resolve, reject) => {

            fs.rename(oldPath, newPath, e => {

                if (e) return reject(e)

                resolve()
            })
        })
    }

    rmdir(destination) {

        return new Promise((resolve, reject) => {

            fs.rmdir(destination, e => {

                if (e) return reject(e)

                resolve()
            })
        })
    }

    async render() {

        const file = this.filename.replace(this.project, 'build')
        const paths = path.parse(file)
        const target = `${paths.dir}/opt-${paths.name}${this.exportExtension}`
        const destination = `${this.project}/${target}`

        const files = await this.optimize(destination)

        if (files[0]) {

            const newPath = files[0].path.replace(`opt-${paths.name}${this.exportExtension}/`, '')
            await this.rename(files[0].path, newPath)
            await this.rmdir(destination)
        }
    }

    get exportExtension() {

        // Keep the same extension
        return path.parse(this.filename).ext
    }
}