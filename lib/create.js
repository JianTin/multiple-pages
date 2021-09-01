const prompts = require('prompts')
const {existsSync, mkdirSync} = require('fs')
const { join } = require('path')
const {removeSync} = require('fs-extra')
const ora = require('ora')
const download = require('download-git-repo')

const cwd = process.cwd()
const gitUrl = 'https://github.com/JianTin/multiple-pages'
class Create {
    constructor(projectName){
        this.name = projectName
    }
    
    // 用户 统一 删除文件夹
    delDir = (path)=> {
        const oraAnimation = ora(`delete ${path}`).start()
        try {
            removeSync(path)
        } catch(err){
            oraAnimation.fail(err, `delete ${path} error`)
            return Promise.resolve(false)
        }
        oraAnimation.succeed(`delete succeed ${path}`)
        return Promise.resolve(true)
    }

    // 如果路径 存在，将会进行递归。
    rest = async (projectName)=> {
        const path = join(cwd, projectName)
        const {name: beforeName, delDir, rest} = this
        // 一样时，提示 是否修改
        if(existsSync(path)){
            console.log('路径重复')
            const promptsOptions = [
                {
                    type: 'toggle',
                    name: 'isDel',
                    message: `is Delete ${projectName}`,
                    initial: true,
                    active: 'yes',
                    inactive: 'no'
                },
                {
                    type: prev => prev === false ? 'text' : null,
                    name: 'newName',
                    message: 'entry new project dir name'
                }
            ]
            const {isDel, newName} = await prompts(promptsOptions)
            // 选择删除，进行文件夹删除
            if(isDel) return delDir(path)
            // 否则 继续递归，传入输入的name
            rest(newName)
        } 
        if(beforeName !== projectName){  // 更新名字
            this.name = projectName
        }
        return Promise.resolve(true)
    }
    
    create = async ()=> {
        const runBoolean = await this.rest(this.name)
        // 删除失败，关闭
        if(!runBoolean) return
        // 创建新文件夹，有可能是更新的
        const newPath = join(cwd, this.name)
        mkdirSync(newPath)
        const oraInstance = ora('download rough-multiple-pages').start()
        download(`direct:${gitUrl}`, newPath, {clone: true}, (err)=>{
            if(err){
                return oraInstance.fail(`${err} download error reset cli`)
            }
            oraInstance.succeed('download succeed')
            console.log(`cd ${this.name}`)
            console.log('npm i')
            console.log('npm run dev')
        })
    }
}

module.exports = Create