const path = require('upath')
const fs = require('fs')
const extensions = require('./extensions')

module.exports = targetDir => {
    const ignores = [
        targetDir,
        path.join(targetDir, '/**/*'),
        function(fileName) {
            return fileName.split('/').filter(part => part.charAt(0) == '~').length > 0 // files or folder that start with a tilda ~
        },
        function(fileName) {
            // Only allow the extensions specified in the extenstions file and folders, ignore the rest
            const ext = path.extname(fileName)
            return fs.existsSync(fileName)
                && fs.lstatSync(fileName).isFile()
                && !extensions.hasOwnProperty(ext)
        },
        /\/\./, //hidden files
        /package\.json/,
        /node_modules/,
        /bower_components/,
        /npm-debug\.log/,
    ]
    return ignores
}