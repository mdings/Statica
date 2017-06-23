'use strict'

const browserify = require('browserify')
const babelify = require('babelify')
const {app} = require('electron').remote
const File = require('../file')

module.exports = class Javascript extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    render() {

        browserify(this.filename)
        .transform(babelify, {

            // The preset should be loaded from the electron directories,
            // not from the project ones
            presets: [`${app.getAppPath()}/node_modules/babel-preset-es2015`]
        })
        .bundle((err, result) => {

            if (err) {

                this.emit('error', err.message)

            } else {

                this.write(result)
            }
        })
    }

    get exportExtension() {

        return '.js'
    }
}
