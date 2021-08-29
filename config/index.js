const {
    resultFolderPath, correctPath, 
    isProduction, initDistPath, initSrcPath, distName, srcName
} = require('./assets.js')
const {compileCss, compileJs, assetsMove, HandelHtml} = require('./compileFn')
const {initServer, reloadStream} = require('./devInit')

const {removeSync} = require('fs-extra')
const {task, series, watch} = require('gulp')
const merge2 = require('merge2')

// classInstance
let WatchClassInstance = ''
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
        /**
         * {
         * D:/project/folder: [watchInstan...]
         * }
        */
        this.watchIntanceStore = {}
        this.initWatchProjectDir(watchProjectPath)
    }

    // 收集 folderKey
    addFolderKey(folder){
        this.watchIntanceStore[folder] = []
    }
    // 收集 watch
    addWatchInstance(folder, watchInstance){
        this.watchIntanceStore[folder].push(watchInstance)
    }
    // 删除 watch
    removeWatch(folder){
        this.watchIntanceStore[folder].forEach(watcher => watcher.close())
        delete this.watchIntanceStore[folder]
    }
    
    // 监听 整个项目的 create / delete dir && watch
    initWatchProjectDir(watchProjectPath){
        watch(
            watchProjectPath,
            {ignorePermissionErrors: true},
            function projectHandel(cb){cb()}
        )
        .on('addDir', path =>{
            const watchFolderKey = correctPath(path)
            this.addFolderKey(watchFolderKey)
            fileTransformStream(watchFolderKey, watchFolderKey.replace(srcName, distName))
        })
        .on('unlinkDir', path => {
            const delSrcFolderKey = correctPath(path)
            this.removeWatch(delSrcFolderKey)
            removeSync(delSrcFolderKey.replace(srcName, distName))
        })
    }

    // 监听
    watchFileChange(keyFolder, srcPath, distPath, compileFn){
        if(isProduction) return
        const watchIntance = watch(
            srcPath,
            {ignorePermissionErrors: true},
            ()=>compileFn(srcPath, distPath).pipe(reloadStream())
        )
        this.addWatchInstance(keyFolder, watchIntance)
    }

    // 监听 config module
    watchConfigModule(){
        const {baseRelyModule, relyModule, compileHtml} = HtmlClassInstance
        watch('../init.config.js', series(
                ()=> merge2([baseRelyModule(), relyModule()]),
                ()=> {
                    const allFloder = resultFolderPath(initSrcPath)
                    allFloder.push(initSrcPath)
                    return merge2(
                        allFloder.map(path => {
                            const htmlPath = correctPath(handelSrcPath(path, 'html'))
                            return compileHtml(htmlPath, path.replace(srcName, distName)).pipe(reloadStream())
                        })
                    )
                }
            )
        )
    }
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

/**
 * @result Array<changFileStream> --- 返回文件转换流 && watchFile
*/
function fileTransformStream(srcPath, distPath){
    return Object.keys(compileObj)
        .map( keyExtension =>{
            // 获取 compile 函数
            const compile = compileObj[keyExtension]
            const srcGlob = handelSrcPath(srcPath, keyExtension)
            // 对每个文件夹底下的 任意资源都进行监听
            if(!isProduction){
                WatchClassInstance.watchFileChange(srcPath, srcGlob, distPath, compile)
            }
            return compile(srcGlob, distPath)
        })
}

task('moveModuleFile', ()=>{
    const {baseRelyModule, relyModule} = HtmlClassInstance
    return merge2([baseRelyModule(), relyModule()])
})

task('compile', function(){
    // 获取 src全部目录
    const resultSrcAllPath = resultFolderPath(initSrcPath)
    // 添加 initSrcPath
    resultSrcAllPath.unshift(initSrcPath)
    // 由 merge2 集中处理所有流
    return merge2(
        // 去除多维数组 和 解构
        ...resultSrcAllPath.map(srcPath=>{
            // 收集 keyFolder
            if(!isProduction){
                WatchClassInstance.addFolderKey(srcPath)
            }
            // 输出的 dist文件夹
            const distPath = srcPath.replace(srcName, distName)
            // 对每个 文件夹下 都进行 js/css/html 编译
            return fileTransformStream(srcPath, distPath)
        }).flat()
    )
})

task('devInit', function(cb){
    WatchClassInstance = new WatchClass(initSrcPath + '/**/*')
    WatchClassInstance.watchConfigModule()
    initServer()
    cb()
})

task('removeInit', (cb)=>{
    removeSync(initDistPath)
    cb()
})

task('dev', series('removeInit', 'devInit', 'moveModuleFile', 'compile', ()=> reloadStream()))
task('build',series('removeInit', 'moveModuleFile', 'compile'))