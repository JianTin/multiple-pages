const {resultFolderPath, isProduction, initDistPath, initSrcPath, distName} = require('./assets.js')
const {compileCss, compileHtml, compileJs, assetsMove} = require('./compileFn')
const {reload, initServer} = require('./devInit')

const {removeSync} = require('fs-extra')
const {task, series, watch} = require('gulp')
const merge2 = require('merge2')

// 已经匹配处理的扩展名
const matchExtension = ['css', 'less', 'js', 'html']

// 处理的 taskFn
const compileObj = {
    all: assetsMove, 
    js: compileJs, 
    html: compileHtml, 
    css :compileCss
}

// 将路径处理为 glob 形式
function handelSrcPath(srcPath, extension){
    let srcGlob = ''
    switch(extension){
        case 'all':
            const excludeArray = matchExtension.map((extension)=> '!' + srcPath + `/*.${extension}`)
            srcGlob = [ srcPath+'/*.*', ...excludeArray]
            break;
        case 'css':
            srcGlob = ['less', 'css'].map(extension=> srcPath+`/*.${extension}`)
            break;
        default:
            srcGlob = srcPath + `/*.${extension}`
    }
    return srcGlob
}

// 监听 并允许重新 编译
function watchFn(srcPath, distPath, compileFn){
    // 判断 watch 初始化 以及 是否为 开发环境
    if(!isProduction){
        watch(
            srcPath, 
            series(
                function(){
                    console.log(srcPath)
                    return compileFn(srcPath, distPath)
                }, 'reload'
            )
        )
    }
}

function mergeCompile(srcPath, distPath){
    return Object.keys(compileObj)
        .map( keyExtension =>{
            // 获取 compile 函数
            const compile = compileObj[keyExtension]
            const srcGlob = handelSrcPath(srcPath, keyExtension)
            // 对每个文件夹底下的 任意资源都进行监听
            watchFn(srcGlob, distPath,compile)
            return compile(srcGlob, distPath)
        })
}

task('compile', function(){
    // 获取 src全部目录
    const resultSrcAllPath = resultFolderPath(initSrcPath)
    // 添加 initSrcPath
    resultSrcAllPath.unshift(initSrcPath)
    // 由 merge2 集中处理所有流
    return merge2(
        // 去除多维数组 和 解构
        ...resultSrcAllPath.map(srcPath=>{
            // 输出的 dist文件夹
            srcPath = srcPath.replace(/\\/g, '/')
            const distPath = srcPath.replace(/src/, distName)
            // 对每个 文件夹下 都进行 js/css/html 编译
            return mergeCompile(srcPath, distPath)
        }).flat()
    )
})

task('devInit', function(cb){
    initServer()
    removeSync(initDistPath)
    cb()
})

// 更新
task('reload', (cb)=>{
    reload()
    cb()
})

task('dev', series('devInit', 'compile', 'reload'))