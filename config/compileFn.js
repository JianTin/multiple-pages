const {join} = require('path')
const {isProduction, root} = require('./assets')

const {src, dest} = require('gulp')
const babel = require('gulp-babel')
const gulpIf = require('gulp-if')
const composer = require('gulp-uglify/composer')
const uglify = require('uglify-js')
const postcss = require('gulp-postcss')
const gulpLess = require('gulp-less')

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

// 移动文件，确保目录
function assetsMove(srcPath, distPath){
    return src(srcPath)
        .pipe(dest(distPath))    
}

// 处理js
function compileJs(srcPath, distPath){
    return src(srcPath)
    .pipe(babel({
        configFile: join(root, '/babel.config.js')
    }))
    .pipe(
        gulpIf(isProduction, codeUglify(uglifyOptions))
    )
    .pipe(dest(distPath))
}

// 处理css
function compileCss(srcPath, distPath){
    // 判断是否是 less 文件
    const isLessFn = function(file){
        return file.extname === '.less'
    }
    return src(srcPath)
    .pipe(
        gulpIf(isLessFn, gulpLess())
    )
    .pipe(postcss())
    .pipe(dest(distPath))
}

// 处理 html
function compileHtml(srcPath, distPath){
    return src(srcPath)
    .pipe(dest(distPath))
}

module.exports = {
    compileJs, compileCss, compileHtml, assetsMove
}