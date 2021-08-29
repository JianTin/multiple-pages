const getInitConfig = require('../init.config')
const {merge} = require('webpack-merge')

const defaultConfig = {
    outputName: 'dist',
    compileSrc: 'src',
    dev: {
        openHtml: 'index.html',
        proxy: []
    },
    baseRely: [
        'node_modules/babel-polyfill/dist/polyfill.min.js'
    ],
    rely: {}
}

exports.default = merge(defaultConfig, getInitConfig())
exports.getConfig = ()=>merge(defaultConfig, getInitConfig())