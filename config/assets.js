const {join, dirname} = require('path')
const {readdirSync, lstatSync} = require('fs')

// 根目录
const root = dirname(__dirname)
// src 路径
const initSrcPath = join(root, '/src')
// distPath 基于 srcPath
const distName = 'dist'
const initDistPath = join(root, `/${distName}`)

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
        const path = join(folderPath, folderName)
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
    isProduction,
    root,
    initSrcPath,
    distName,
    initDistPath
}