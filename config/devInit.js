const browServer = require('browser-sync').create()
const {createProxyMiddleware} = require('http-proxy-middleware')

const {initDistPath} = require('./assets')
const { default: {dev} } = require('./userConfig')
const {openHtml, proxy} = dev

function resultProxyMiddleware(proxy){
    if(proxy.length === 0) return []
    return Object.keys(proxy).map(context => createProxyMiddleware(context, proxy[context]))
}

function initServer(){
    browServer.init({
        server: {
            baseDir: initDistPath
        },
        open: true,
        startPath: openHtml,
        middleware: resultProxyMiddleware(proxy)
    })
}

module.exports = {
    initServer,
    reloadStream: browServer.stream
}