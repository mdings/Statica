const path = require('upath')
const fs = require('fs')

module.exports = function (targetDir){

    const ignores = [

        targetDir,
        // /\./, // hidden files
        // /package\.json/,
        // /node_modules/,
        // /bower_components/,
        // /npm-debug\.log/,
    ]

    return ignores
}