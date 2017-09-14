'use strict'

const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const {app} = require('electron').remote
const File = require('../file')
const path = require('upath')

let cache

module.exports = class Javascript extends File {

    constructor(filename, project) {

        super(filename, project)
    }

    render() {

        const file = this

        rollup.rollup({

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

                // Don't print out any warning to the error log
                file.emit('notification', warning.message, path.parse(file.filename))
                return
            }
        }).then(bundle => {

            const result = bundle.generate({

                // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
                format: 'umd',
                moduleName: 'Statica',
            }).then(result => {

                cache = bundle
                this.write(result.code)
            })

            // // Alternatively, let Rollup do it for you
            // // (this returns a promise). This is much
            // // easier if you're generating a sourcemap
            // bundle.write({
            //     format: 'cjs',
            //     dest: 'bundle.js'
            // });

        }).catch(err => {

            this.emit('error', err.message.replace(`${this.filename}:`, ''), err.code, path.parse(this.filename))
        })
    }

    get exportExtension() {

        return '.js'
    }
}
