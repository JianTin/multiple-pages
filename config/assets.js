const {join, dirname} = require('path')
const {readdirSync, lstatSync} = require('fs')
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

/**
 * 修改 node join 路径 C:\\ -> C:/
 * @params path --- 修改的路径
 * @result result --- 修改后的路径
 * */ 
function correctPath(path){
    return path.replace(/\\/g, '/')
}

/**
 *  递归获取src每个文件夹路径
 *  @params folderPath --- 递归的文件夹路径
 *  @return result --- 获得src目录下的全部 文件夹目录
*/
function resultFolderPath(folderPath){
    // 获取文件夹下 的 名字
    const folderNameArray = readdirSync(folderPath)
    const result = folderNameArray.reduce( (prev, folderName) =>{
        // 组合为 folderPath + name
        const path = correctPath(join(folderPath, folderName))
        // 判断是不是 文件夹
        const isDirectory = lstatSync(path).isDirectory()
        // 不是文件夹 退出
        if(!isDirectory) return prev;
        // 是文件夹 组合 递归
        prev.push(path, ...resultFolderPath(path))
        return prev
    }, [])
    return result
}

// 是否是 打包环境
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
    resultFolderPath,
    correctPath,
    isProduction,
    root,
    srcName,
    initSrcPath,
    distName,
    initDistPath,
    distBaseRelyPath,
    distRelyPath
}