'use strict'

const fs = require('fs')
const path = require('upath')
const pug = require('pug')
const ejs = require('ejs')
const matter = require('gray-matter')
const md = require('markdown-it')({html: true})
const findUp = require('find-up')
const File = require('../file')

const isDirectory = source => {

    return fs.lstatSync(source).isDirectory()
}

const getDirectories = source => {

    return fs.readdirSync(source)
        .map(name => path.join(source, name))
        .filter(isDirectory)
}

const findClosestLayout = (filename, files) => {

    return new Promise((resolve, reject) => {

        findUp(files, {

            cwd: path.dirname(filename)
        }).then(filepath => {

            resolve(filepath)
        })
    })
}

module.exports = class Page extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    async markdown() {

        try {

            // Finds the closest layout file to the currently parsed markdown file
            const layoutFile = await findClosestLayout(this.filename, [
                '_layout.pug',
                '_layout.jade',
                '_layout.html',
                '_layout.htm',
                '_layout.ejs'
            ])

            // Define data object and get the frontmatter
            const data = await this.getFrontMater(this.filename)
            // Rename the data object to meta
            data.meta = data.data
            data.content = md.render(data.content)

            if (layoutFile) {

                // Wrap the data in a layout file if found
                const ext = path.extname(layoutFile)

                if (ext == '.pug'
                    || ext == '.jade') {

                    return await this.pug(layoutFile, data)

                } else {

                    return await this.ejs(layoutFile, data)
                }

            }  else {

                return data
            }

        } catch (err) {

            return Promise.reject(err)
        }
    }

    pug(filename, data) {

        return new Promise((resolve, reject) => {

            const compiled = pug.compileFile(filename)
            resolve(compiled(data))
        })
    }

    ejs(filename, data) {

        return new Promise((resolve, reject) => {

            ejs.renderFile(filename, data, {}, (err, result) => {

                if (err) reject(err)
                resolve(result)
            })
        })
    }

    async render(resolve, reject) {

        if (this.isMarkDown) {

            try {

                const output = await this.markdown()
                await this.write(output)

            } catch (err) {

                // this.emit('error', err.message, 'something went wrong', path.parse(this.filename))
                return Promise.reject(err.message, this.filename)
            }

        } else if (this.isPug) {

            try {

                const output = await this.pug(this.filename, data)
                await this.write(output)

            } catch (err) {

                return Promise.reject(err.message, this.filename)
            }

        } else if (this.isHTML) {

            try {

                const input = this.read()

                // Enable partials for regular HTML-files
                const output = input.replace(/\<\!-- @include (.*) --\>/g, (match, file) => {

                    return fs.readFileSync(`${this.project.path}/${file}`);
                })

                // Writeout
                await this.write(output)

            } catch (err) {

                // this.emit('error', err.message, 'nee', path.parse(this.filename))
                return Promise.reject(err.message, this.filename)
                // return Promise.reject()
            }
        }
    }

    getFrontMater(file) {

        return new Promise((resolve, reject) => {

            resolve(matter.read(file))
        })
    }

    get exportExtension() {

        return '.html'
    }

    get isHTML() {

        return path.parse(this.filename).ext == '.html'
            || path.parse(this.filename).ext == '.htm'
    }

    get isMarkDown() {

        return path.parse(this.filename).ext == '.md'
            || path.parse(this.filename).ext == '.markdown'
    }

    get isPug() {

        return path.parse(this.filename).ext == '.pug'
            || path.parse(this.filename).ext == '.jade'
    }
}