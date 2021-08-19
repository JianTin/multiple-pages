const {task, src, dest} = require('gulp')
const {join, dirname} = require('path')
const {removeSync} = require('fs-extra')
const merge2 = require('merge2')
const {resultFolderPath} = require('./assets.js')

const root = dirname(__dirname)
// src 路径
const initSrcPath = join(root, '/src')
// distPath 基于 srcPath
const distName = 'dist'
const initDistPath = join(root, `/${distName}`)

function compileJs(srcPath, distPath){
    srcPath += '/*.js'
    return src(srcPath)
    .pipe(dest(distPath))
}

function compileCss(srcPath, distPath){
    srcPath += '/*.css'
    return src(srcPath)
    .pipe(dest(distPath))
}

function compileHtml(srcPath, distPath){
    srcPath += '/*.html'
    return src(srcPath)
    .pipe(dest(distPath))
}

task('compile', function(){
    // 清除 dist 目录
    removeSync(initDistPath)
    // 获取 src全部目录
    const resultSrcAllPath = resultFolderPath(initSrcPath)
    // 添加 initSrcPath
    resultSrcAllPath.unshift(initSrcPath)

    // 由 merge2 集中处理所有流
    return merge2(
        // 去除多维数组 和 解构
        ...resultSrcAllPath.map(srcPath=>{
            // 输出的 dist文件夹
            const distPath = srcPath.replace(/src/, distName)
            // 对每个 文件夹下 都进行 js/css/html 编译
            return [
                compileJs(srcPath, distPath),
                compileCss(srcPath, distPath),
                compileHtml(srcPath, distPath)
            ]
        }).flat()
    )
})