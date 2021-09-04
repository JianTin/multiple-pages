const {join, dirname} = require('path')
const {default: {outputName, compileSrc}} = require('./userConfig')

// 根目录
const root = correctPath(dirname(__dirname))
// src 路径
const srcName = compileSrc
const initSrcPath = correctPath(join(root, srcName))
// distPath 基于 srcPath
const distName = outputName
const initDistPath = correctPath(join(root, `/${distName}`))
// 定义baseRely目录
const distBaseRelyPath = join(initDistPath, 'baseRely')
// 定义rely目录
const distRelyPath = join(initDistPath, 'rely')
const initConfigPaht = join(root, '/init.config.js')

/**
 * 修改 node join 路径 C:\\ -> C:/
 * @params path --- 修改的路径
 * @result result --- 修改后的路径
 * */ 
function correctPath(path){
    return path.replace(/\\/g, '/')
}

// 是否是 打包环境
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
    correctPath,
    isProduction,
    root,
    srcName,
    initSrcPath,
    distName,
    initDistPath,
    distBaseRelyPath,
    distRelyPath,
    initConfigPaht
}