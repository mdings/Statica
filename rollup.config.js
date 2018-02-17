import babel from 'rollup-plugin-babel';
import scss from 'rollup-plugin-scss'

const plugins = [scss({
    output: './dist/bundle.css'
}), babel({
    exclude: 'node_modules/**'
})]

export default [{
    // We need to create a different format for electron, since that does not support es6 modules
    input: './src/app/persist.js',
    output: {
        file: './src/app/persist.cjs.js',
        format: 'cjs'
    }
}, {
    input: './src/app/projects/index.js',
    output: {
        file: './dist/projects.js',
        format: 'cjs'
    },
    plugins: plugins
}, {
    input: './src/app/services/index.js',
    output: {
        file: './dist/services.js',
        format: 'cjs'
    },
    plugins: plugins
}]