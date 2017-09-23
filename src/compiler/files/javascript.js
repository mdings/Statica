'use strict'

const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const {app} = require('electron').remote
const File = require('../file')
const path = require('upath')
const uglifyjs = require('uglify-js');

let cache

module.exports = class Javascript extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    rollup() {

        const file = this

        return rollup.rollup({
            entry: this.filename,
            cache: cache,
            sourceMap: true,
            plugins: [
                // This plugin tries to resolve modules from the node_modules folder
                resolve({
                    jsnext: true,
                    main: true
                }),
                // This plugins converts commonJS (require) calls to ES6 (import) calls
                cjs(),
                babel({
                    presets: [`${app.getAppPath()}/node_modules/babel-preset-es2015-rollup`]
                })
            ],
            onwarn(warning) {

                file.emit('notification', warning.message, path.parse(file.filename))
            }
        })
    }

    optimize(code) {

        return new Promise((resolve, reject) => {

            const optimized = uglifyjs.minify(code, {
                warnings: true
            })

            if (optimized.error) {

                file.emit('notification', optimized.error, path.parse(file.filename))
                return reject()
            }

            resolve(optimized)
        })
    }

    async render(isProduction = false) {

        // Set the production flag
        this.isProduction = isProduction

        try {

            const data = await this.rollup()

            cache = data

            const bundle = await data.generate({

                // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
                format: 'umd',
                moduleName: 'Statica',
            })

            if (this.isProduction) {

                const optimized = await this.optimize(bundle.code)
                await this.write(optimized.code)

            } else {

                await this.write(bundle.code)
            }

        } catch (err) {

            const message = err.message.replace(`${this.filename}:`, '')
            this.emit('error', message, err.code, path.parse)
        }
    }

    get exportExtension() {

        return '.js'
    }
}
