const cssnano = require('cssnano')
const postcssPresetEnv = require('postcss-preset-env')
const defaultPreset = require('cssnano-preset-default')

module.exports = {
    plugins: [
        postcssPresetEnv(),
        cssnano({
            preset: defaultPreset(),
            plugins: [
                'postcss-merge-idents',
                ['postcss-discard-unused', {
                        fontFace: false, namespace: false
                }],
                ['postcss-reduce-idents', {
                    gridTemplate: false
                }]
            ]
        })
    ]
}