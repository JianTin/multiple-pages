const {initDistPath, initSrcPath, initConfigPaht} = require('./assets.js')
const {compileCss, compileJs, assetsMove, HandelHtml} = require('./compileFn')
const {initServer, reload} = require('./devInit')

const {removeSync} = require('fs-extra')
const {task, series, watch} = require('gulp')
const merge2 = require('merge2')

let HtmlClassInstance = new HandelHtml()
// 已经匹配处理的扩展名
const matchExtension = ['css', 'less', 'js', 'html']
// 处理的 taskFn
const compileObj = {
    all: assetsMove, 
    js: compileJs, 
    html: HtmlClassInstance.compileHtml,
    css :compileCss
}

/**
 *  该类作用与 文件夹 创建 / 删除 监听 + 文件变化
*/
class WatchClass {
    constructor(watchProjectPath){
        // 监听 src project
        this.initWatchProjectDir(watchProjectPath)
        // 监听 init.config.js
        this.watchConfigModule()
    }
    
    // 监听 整个项目
    initWatchProjectDir(watchProjectPath){
        watch(
            watchProjectPath,
            {ignorePermissionErrors: true},
            series('compile', 'reload')
        )
    }

    // 监听 config module
    watchConfigModule(){
        const {baseRelyModule, relyModule, compileHtml} = HtmlClassInstance
        watch(initConfigPaht, series(
                ()=> merge2([baseRelyModule(), relyModule()]),
                ()=> {
                    let srcPath = initSrcPath+'/**/*.html' 
                    return compileHtml(srcPath, initDistPath)
                },
                'reload'
            )
        )
    }
}

// 将路径处理为 glob 形式
function handelSrcPath(srcPath, extension){
    let srcGlob = ''
    switch(extension){
        case 'all':
            const excludeArray = matchExtension.map((extension)=> '!' + srcPath + `/**/*.${extension}`)
            srcGlob = [ srcPath+'/**/*', ...excludeArray]
            break;
        case 'css':
            srcGlob = ['less', 'css'].map(extension=> srcPath+`/**/*.${extension}`)
            break;
        default:
            srcGlob = srcPath + `/**/*.${extension}`
    }
    return srcGlob
}

task('compile', function(){
    const distPath = initDistPath
    const srcPath = initSrcPath
    // 由 merge2 集中处理所有流
    return merge2(
        Object.keys(compileObj)
        .map( keyExtension =>{
            // 获取 compile 函数
            const compile = compileObj[keyExtension]
            const srcGlob = handelSrcPath(srcPath, keyExtension)
            return compile(srcGlob, distPath)
        })
    )
})

task('removeInit', (cb)=>{
    removeSync(initDistPath)
    cb()
})

task('devInit', function(cb){
    new WatchClass(initSrcPath + '/**/*')
    initServer()
    cb()
})

task('moveModuleFile', ()=>{
    const {baseRelyModule, relyModule} = HtmlClassInstance
    return merge2([baseRelyModule(), relyModule()])
})

task('reload', (cb)=>{
    reload()
    cb()
})

task('dev', series('removeInit', 'devInit', 'moveModuleFile', 'compile', 'reload'))
task('build',series('removeInit', 'moveModuleFile', 'compile'))