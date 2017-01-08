'use strict'

const browserify = require('browserify')
const {app} = require('electron').remote
const File = require('../file')

module.exports = class Javascript extends File {

    constructor(filepath, sourceDir, targetDir) {
        super(filepath, sourceDir, targetDir)
    }
    
    render(resolve, reject) {
        console.log(this.info)
        browserify(this.info.path)
        .transform('babelify', {
            // The preset should be loaded from the electron directories,
            // not from the project ones
            presets: [`${app.getAppPath()}/node_modules/babel-preset-es2015`]
        })
        .bundle((e, result) => {
            if(e) reject(e)
            this.write(result, resolve)
        })
    }
    
    get exportExtension() {
        return 'js'
    }
}