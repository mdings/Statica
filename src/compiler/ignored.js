const path = require('upath')
const fs = require('fs')

module.exports = targetDir => {
    const ignores = [
        targetDir,
        path.join(targetDir, '/**/*'),
        function(string) {
            return string.split('/').filter(part => part.charAt(0) == '~').length > 0 // files or folder that start with a tilda ~
        },
        /\/\./, //hidden files
        /package\.json/,
        /node_modules/,
        /bower_components/,
        /npm-debug\.log/,
    ]
    return ignores
}