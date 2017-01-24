'use strict'

const ee = require('event-emitter')
const path  = require('upath')
const chokidar = require('chokidar')
const ignored = require('./ignored')
const extensions  = require('./extensions')
const collection  = require('./collection')
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
        const type = extensions[ext] || 'other'
        const file = new fileTypes[type](filename, sourceDir, targetDir)

        if(!hasUnderscore(filename)) {
            files.push(file)
            emitter.emit('file-add', file)
        }
    }

    function createCollection(dirname) {
        emitter.emit('set-collection', dirname)
    }

    chokidar.watch(sourceDir, {ignored: ignored(sourceDir, targetDir)})
        .on('add', filename => createFile(path.normalize(filename)))
        .on('addDir', dirname => createCollection(path.normalize(dirname)))
        .on('change', filename => {
            // Get the extension
            const ext = path.extname(filename).toLowerCase().slice(1)
            
            
            // Update pages that make use of a layout file when it has changed
            // @TODO: support handlebars/ejs as well
            // @TODO: might need some refactoring
            // @TODO: the browsersync plugin should work an all pages
            if (path.basename(filename) == '_layout.pug') {
                var filtered = files.filter(file => {
                    return file.info.path.startsWith(path.dirname(filename))
                        && (file.ext == 'markdown' || file.ext == 'md')
                })
            } else {
                // Update the collections when a markdown file was changed inside that dir
                if(ext == 'md' || ext == 'markdown') {
                    emitter.emit('set-collection', path.dirname(filename))
                }

                // Filter the files bases on their type
                var filtered = files.filter(file => {
                    // Render only the 'masters' for the javascript and stylesheet
                    if (extensions[ext] == 'javascript' || 
                        extensions[ext] == 'stylesheet') {
                        return file.type == extensions[ext]
                    } else {
                        return file.type == extensions[ext]
                            && file.info.path == filename
                    }
                })
            }

            console.log(filtered)
            emitter.emit('render-type', filtered)
        })
        .on('ready', () => {
            console.log('all done!')
            // Might be a good idea to create the collections here first!
            // Do an initial render when the project is created/added
            // emitter.emit('render-all', files)
        })

    process.nextTick(() => {
        emitter.emit('started')
    })

    return emitter
}