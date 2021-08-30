const config = require('../init.config')
const {merge} = require('webpack-merge')
const {join, dirname} = require('path')
const {readFileSync} = require('fs')

const initConfigPath = join( dirname(__dirname), '/init.config.js')

const defaultConfig = {
    outputName: 'dist',
    compileSrc: 'src',
    viewportWidth: false,
    dev: {
        openHtml: 'index.html',
        proxy: []
    },
    baseRely: [
        'node_modules/babel-polyfill/dist/polyfill.min.js'
    ],
    rely: {}
}

exports.default = merge(defaultConfig, config)
exports.getConfig = ()=>{
    const contents = readFileSync(initConfigPath).toString()
    return merge(defaultConfig, eval(contents))
}
