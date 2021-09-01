#!/usr/bin/env node
const {program} = require('commander')
const {version} = require('../package.json')
const Create = require('./create')

main()

async function main(){
    program
        .version(version)
        .argument('[projectName]', 'youre project name', 'app')
        .action(run)
    await program.parseAsync(process.argv)
}

async function run(projectName){
    const createInstance = new Create(projectName)
    await createInstance.create()
}
