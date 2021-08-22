const {join, dirname} = require('path')
const {resultFolderPath} = require('./assets.js')

const {removeSync} = require('fs-extra')
const {task, src, dest} = require('gulp')
const merge2 = require('merge2')
const babel = require('gulp-babel')
const gulpIf = require('gulp-if')
const composer = require('gulp-uglify/composer')
const uglify = require('uglify-js')
const postcss = require('gulp-postcss')
const gulpLess = require('gulp-less')

// 根目录
const root = dirname(__dirname)
// src 路径
const initSrcPath = join(root, '/src')
// distPath 基于 srcPath
const distName = 'dist'
const initDistPath = join(root, `/${distName}`)
// 是否是 打包环境
const isProduction = process.env.NODE_ENV === 'production'
// 添加压缩参数
const codeUglify = composer(uglify, console.log)
// 压缩参数
const uglifyOptions = {
    compress: {
        drop_console: isProduction
    },
    mangle: {
        toplevel: isProduction
    }
}
// 已经匹配处理的扩展名
const matchExtension = ['css', 'less', 'js', 'html']

function assetsMove(srcPath, distPath){
    const excludeArray = matchExtension.map((extension)=> '!' + srcPath + `/*.${extension}`)
    const matchGlobArray = [ srcPath+'/*.*', ...excludeArray]
    return src(matchGlobArray)
        .pipe(dest(distPath))    
}

function compileJs(srcPath, distPath){
    srcPath += '/*.js'
    return src(srcPath)
    .pipe(babel({
        configFile: join(root, '/babel.config.js')
    }))
    .pipe(
        gulpIf(isProduction, codeUglify(uglifyOptions))
    )
    .pipe(dest(distPath))
}

function compileCss(srcPath, distPath){
    const styleGlob = ['less', 'css'].map((extension)=> srcPath + `/*.${extension}` )
    // 判断是否是 less 文件
    const isLessFn = function(file){
        const fileName = file.basename
        const startSlice = fileName.indexOf('.') + 1
        return fileName.substring(startSlice) === 'less'
    }
    return src(styleGlob)
    .pipe(
        gulpIf(isLessFn, gulpLess())
    )
    .pipe(postcss())
    .pipe(dest(distPath))
}

function compileHtml(srcPath, distPath){
    srcPath += '/*.html'
    return src(srcPath)
    .pipe(dest(distPath))
}

function init(){
    // 清除 dist 目录
    removeSync(initDistPath)
}

task('compile', function(){
    init()
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
                assetsMove(srcPath, distPath),
                compileJs(srcPath, distPath),
                compileCss(srcPath, distPath),
                compileHtml(srcPath, distPath)
            ]
        }).flat()
    )
})