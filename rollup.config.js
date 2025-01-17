const babel = require('@rollup/plugin-babel');
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');
const html = require('@rollup/plugin-html');
const resolve = require('@rollup/plugin-node-resolve');
const url = require('@rollup/plugin-url');
const css = require('rollup-plugin-css-only');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');

module.exports = {
    input: './src/components/index.js',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [
        resolve({
            extensions: ['.js', '.jsx'],
        }),
        commonjs({
            include: ['node_modules/**'],
        }),
        babel({ babelHelpers: 'bundled' }),
        css({
            // Optional: filename to write all styles to
            output: 'bundle.css',
        }),
        url(),
        html({
            template: ({ bundle }) => {
                const bundleFileKeys = Object.keys(bundle);
                const css = bundleFileKeys
                    .map((entryFile) => {
                        if (entryFile.includes('.css')) {
                            return `<link rel='stylesheet' href=${entryFile}></link>`;
                        }
                    })
                    .join('\n');

                const scripts = bundleFileKeys
                    .map((entryFile) => {
                        if (entryFile.includes('.js')) {
                            return `<script type='module' src=${entryFile}></script>`;
                        }
                    })
                    .join('\n');

                return `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>React + Webpack</title>
                        ${css}
                    </head>
                    <body>
                        <div id="root"></div>
                        ${scripts}
                    </body>
                    </html>
                `;
            },
            fileName: 'index.html',
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            preventAssignment: true,
        }),
        serve('dist'),
        livereload(),
    ],
};
