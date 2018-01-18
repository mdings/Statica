'use strict'

const {app} = require('electron').remote
const File = require('../file')
const utils = require('../utils')
const path = require('upath')

const rollup = require('rollup')
const babelrc = require('babelrc-rollup')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const coffee = require('rollup-plugin-coffee-script')
const nodeGlobals = require('rollup-plugin-node-globals')
const resolve = require('rollup-plugin-node-resolve')
const uglifyjs = require('uglify-js');

/* for vue implementation */
// const vue = require('rollup-plugin-vue')
// const alias = require('rollup-plugin-alias')

let cache

const babelConfig = {
    compact: true,
    presets: [
        [`${app.getAppPath()}/node_modules/babel-preset-env`, {
            targets: {
                browsers: ['last 2 versions']
            },
            loose: false
        }]
    ]
};

module.exports = class Javascript extends File {

    constructor(filename, project) {
        super(filename, project)
    }

    coffeeify(options) {
        return this.isCoffee ? [coffee()] : []
    }

    vueify() {
        // something like main.vue.js, app.vue.coffee etc..
        if (/.*vue\.(js|coffee|ts)/i.test(this.filename)) {
            return [
                alias({
                    vue: `${this.project.path}/node_modules/vue/dist/vue.esm.js`
                }),
                vue({
                    autoStyles: false,
                    compileTemplate: true,
                    css(style, styles, compiler) {}
                })
            ]
        } else {
            return []
        }
    }

    rollup() {
        const file = this
        let plugins = [
            babel(babelrc.default({
                addExternalHelpersPlugin: false,
                config: babelConfig,
                exclude: `${this.project.path}/node_modules/**`
            })),
            resolve({
                jsnext: true,
                main: true
            }),
            cjs(),
            nodeGlobals()
        ]

        // Prepend extra plugins based on the type of file
        plugins.unshift(...this.coffeeify())
        // plugins.unshift(...this.vueify())

        return rollup.rollup({
            entry: this.filename,
            cache: cache,
            sourceMap: true,
            plugins: plugins,
            onwarn: warning => {
                // This is triggered when a global dependeny is not resolved, like jQuery or underscore, typically something like const $ = require('jQuery')
                if (warning.code == 'UNRESOLVED_IMPORT') {
                    let message = warning.message
                    let subtitle = ''
                    const relativeFile = utils.findRelativePath(message)
                    if (relativeFile) {
                        message = message.replace(relativeFile, path.parse(relativeFile).base)
                        subtitle = `Error in ${path.parse(relativeFile).base}`
                    }

                    utils.notify(
                        `Failed to compile ${this.project.name}`,
                        subtitle,
                        message
                    )
                }
            }
        })
    }

    generate(data) {
        return data.generate({
            // output format - 'amd', 'cjs', 'es', 'iife', 'umd'
            format: 'umd',
            moduleName: 'Statica',
        })
    }

    optimize(code) {
        return new Promise((resolve, reject) => {
            const optimized = uglifyjs.minify(code, {
                warnings: true
            })
            if (optimized.error) {
                return reject({
                    message: optimized.error
                })
            }
            resolve(optimized)
        })
    }

    async render(isProduction = false) {
        try {
            const data = await this.rollup()
            cache = data
            const bundle = await this.generate(data)

            if (isProduction === true) {
                const optimized = await this.optimize(bundle.code)
                await this.write(optimized.code)

            } else {
                await this.write(bundle.code)
            }

        } catch (err) {
            const message = err.message.replace(`${this.filename}:`, '')
            if (err.code == 'PLUGIN_ERROR') {
                // strip the filename and linenumbers from the message
                // @TODO: regex
                err.message =
                    message
                        .replace(`${err.id}: `, '')
                        .replace(`(${err.loc.line}:${err.loc.column})`, '')
                err.filename = err.id
                err.line = err.loc.line

            // This is triggered when a local/relative dependeny is not resolved. Typically something like const $ = require('../test/test')
            } else if (err.code == 'UNRESOLVED_IMPORT') {
                const relativeFilename = utils.findRelativePath(err.message)
                if (relativeFilename ) {
                    err.message = err.message.replace(relativeFilename, '')
                    err.filename = path.parse(relativeFilename).base
                }
            }
            throw this.error(err)
        }
    }

    get isCoffee() {
        return path.parse(this.filename).ext == '.coffee'
    }

    get isVue() {
        return path.parse(this.filename).ext == '.vue'
    }

    get exportExtension() {

        return '.js'
    }
}
