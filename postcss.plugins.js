const cssnano = require('cssnano')
const postcssPresetEnv = require('postcss-preset-env')
const defaultPreset = require('cssnano-preset-default')
const pxtoviewport = require('postcss-px-to-viewport')
const {default: {viewportWidth}} = require('./config/userConfig')

const viewportPlugin =  viewportWidth ? pxtoviewport({viewportWidth}) : viewportWidth

const plugins = [
    viewportPlugin,
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
].filter( plugin => plugin !== false)

module.exports = plugins