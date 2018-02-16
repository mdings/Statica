import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default [{
    input: './src/app/projects/index.js',
    output: {
        file: './dist/projects.js',
        format: 'cjs'
    },
    plugins: [resolve(), babel({
        exclude: 'node_modules/**'
    })]
}]