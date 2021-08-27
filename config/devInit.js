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

module.exports = {
    initServer,
    reload: browServer.reload
}