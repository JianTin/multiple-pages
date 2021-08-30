const cssnano = require('cssnano')
const postcssPresetEnv = require('postcss-preset-env')
const defaultPreset = require('cssnano-preset-default')
const {readFileSync} = require('fs')
const {join} = require('path')
// const pxtoviewport = require('postcss-px-to-viewport')
// const {default: {viewportWidth}} = require('./config/userConfig')

module.exports = (ctx) =>{
    console.log(ctx)
    // const viewportPlugin =  viewportWidth ? pxtoviewport({viewportWidth}) : viewportWidth

    const plugins = [
        // viewportPlugin,
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

    console.log(plugins)
    return {
        plugins
    }
}

// module.exports = {
//     plugins: [
//         // viewportPlugin,
//         postcssPresetEnv(),
//         cssnano({
//             preset: defaultPreset(),
//             plugins: [
//                 'postcss-merge-idents',
//                 ['postcss-discard-unused', {
//                         fontFace: false, namespace: false
//                 }],
//                 ['postcss-reduce-idents', {
//                     gridTemplate: false
//                 }]
//             ]
//         })
//     ]
// }