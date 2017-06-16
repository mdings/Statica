const path = require('upath')
const fs = require('fs')

module.exports = function (sourceDir, targetDir){
    
    const ignores = [
        targetDir,
        path.join(targetDir, '/**'),
        /\/\./, // hidden files
        /package\.json/,
        /node_modules/,
        /bower_components/,
        /npm-debug\.log/,
    ]

    return ignores
}