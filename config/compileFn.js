/**
 *  compileFile
 * @result --- stream
*/

const {join, relative, basename} = require('path')
const {readdirSync, existsSync} = require('fs')
const {Buffer: {from}} = require('buffer')
const {isProduction, root, distBaseRelyPath, srcName, distName, correctPath, distRelyPath, initSrcPath} = require('./assets')
const { default: {baseRely, rely, baseCss}, getConfig } = require('./userConfig')
const postcssConfig = require('../postcss.plugins')

const {src, dest} = require('gulp')
const babel = require('gulp-babel')
const gulpIf = require('gulp-if')
const composer = require('gulp-uglify/composer')
const uglify = require('uglify-js')
const postcss = require('gulp-postcss')
const gulpLess = require('gulp-less')
const through = require('through2')
const {uniq} = require('lodash')

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
    .pipe(postcss(postcssConfig))
    .pipe(dest(distPath))
}

class HandelHtml {
    constructor(){}

    // 移动 npmModule/dist -> dist/baseRely|rely
    moveModuleFile = (npmModule, storeDistPath) => {
        // 防止多次覆盖
        let storeModuleName = null
        if(existsSync(storeDistPath)){
            storeModuleName = readdirSync(storeDistPath)
        }
        // 移动的模块
        const globArray = []
        npmModule.forEach(module=>{
            // 防止多次覆盖
            if(storeModuleName && storeModuleName.includes(basename(module))) return
            globArray.push(join(root, module))
        })
        return src(globArray.length === 0 ? '.' : globArray , {allowEmpty: true})
        .pipe(dest(storeDistPath))
    }

    baseRelyModule = () => {
        // [module, module]
        const {moveModuleFile} = this
        return moveModuleFile([baseCss, baseRely].flat(), distBaseRelyPath)
    }

    relyModule = () => {
        const {moveModuleFile} = this
        // [module, module]
        const relyModule = uniq(Object.values(rely).flat())
        return moveModuleFile(relyModule, distRelyPath)
    }

    // script
    generateScript = (relyFilePath) => {
        return `<script src='${relyFilePath}'></script>\n`
    }

    generateLink = (path) => {
        return `<link href='${path}' rel="stylesheet" />`
    }

    // 查询 distHtml -> module 的相对路径
    distRelativePath = (htmlPath, distModule) => {
        const distHtmlPath = htmlPath.replace(srcName, distName)
        // 查询 相对路径
        return relative(distHtmlPath, distModule)
    }

    // 生成 base script Element
    generateRely = (type, srcDirname, relyArray, relyPath)=>{
        const {distRelativePath, generateScript, generateLink} = this
        const relativePath = distRelativePath(srcDirname, relyPath)
        const generate = type === 'js' ? generateScript : generateLink
        // 查询 要依赖的文件
        return relyArray.reduce((prev, name)=>{
            const moduleRelativePath = correctPath(join(relativePath, basename(name)))
            prev += generate(moduleRelativePath)
            return prev
        }, '')
    }

    hintHolder = (contentString, holder, elseCall)=> {
        if(!contentString.includes(holder)){
            console.error(path, `no replaceholder ${holder}`)
        } else {
            elseCall()
        }
    }

    // 处理 html
    compileHtml = (srcPath, distPath) => {
        const {generateRely, hintHolder} = this
        // 每次获取最新的
        const {baseRely, rely, baseCss} = getConfig()
        return src(srcPath)
        .pipe(through.obj(function(chunk, enc, callback){
            // dirname -> srcPath,!basename
            // path -> srcPath
            const {contents, dirname, path} = chunk
            // css 依赖
            let relyCss = generateRely('css', dirname, baseCss, distBaseRelyPath)
            // 生成 baseScript
            const baseScript = generateRely('js', dirname, baseRely, distBaseRelyPath)
            // 特定 html 依赖
            let relyScript = ''
            // 生成 relyKey
            const htmlkey = correctPath(path).replace(initSrcPath, '').slice(1)
            if(rely[htmlkey]){
                relyScript = generateRely('js', dirname, rely[htmlkey], distRelyPath)
            }
            let contentString = contents.toString()
            // 提示，以及转换
            hintHolder(contentString, '<!-- polyfill and npmModule -->', ()=>{
                contentString = contentString.replace(
                    '<!-- polyfill and npmModule -->', `${baseScript + relyScript}`
                )
            })
            hintHolder(contentString, '<!-- relyLink -->', ()=>{
                contentString = contentString.replace( '<!-- relyLink -->', relyCss )
            })
            // 转换为 buffer 
            chunk.contents = from(contentString)
            callback(null, chunk)
        }))
        .pipe(dest(distPath))
    }

}

module.exports = {
    compileJs, compileCss, assetsMove, HandelHtml
}