'use strict'

const ee = require('event-emitter')
const path  = require('upath')
const chokidar = require('chokidar')
const ignored = require('./ignored')
const extensions  = require('./extensions')
const fileTypes  = require('require-dir')('./files')

module.exports = function (sourceDir, targetDir) {

    const emitter = ee()
    var files = []

    function hasUnderscore(filename) {
        const parts = path.normalize(filename).split('/')

        const scores = parts.filter(part => {
            return part.charAt(0) == '_'
        })

        return scores.length > 0 ? true : false
    }

    function createFile(filename) {
        const ext = path.extname(filename).toLowerCase().slice(1)
        const type = extensions[ext]
        const file = new fileTypes[type](filename, sourceDir, targetDir)

        if(!hasUnderscore(filename)) {
            files.push(file)
            emitter.emit('file-add', file)
        }
    }

    chokidar.watch(sourceDir, {ignored: ignored(sourceDir, targetDir)})
        .on('add', filename => createFile(path.normalize(filename)))
        .on('change', filename => {
            // Get the extension
            const ext = path.extname(filename).toLowerCase().slice(1)
            
            // Filter the files bases on their type
            const filtered = files.filter(file => {
                // For pages, only the one changed needs to be rendered, not all the 'masters'
                if (extensions[ext] == 'page') {
                    return file.type == extensions[ext]
                        && file.info.path == filename
                } else {
                    return file.type == extensions[ext]
                }
            })

            emitter.emit('render-type', filtered)
        })
        .on('ready', () => {
            // Do an initial render when the project is created/added
            emitter.emit('render-all', files)
        })

    process.nextTick(() => {
        emitter.emit('started')
    })

    return emitter
}