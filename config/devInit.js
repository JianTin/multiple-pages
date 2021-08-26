const browServer = require('browser-sync').create()
const {initDistPath} = require('./assets')
const {createProxyMiddleware} = require('http-proxy-middleware')

function initServer(){
    browServer.init({
        server: {
            baseDir: initDistPath
        },
        open: false,
        startPath: 'first/index.html'
    })
}

function reload(cb){
    console.log('reload')
    browServer.reload()
    cb()
}

module.exports = {
    initServer,
    reload
}