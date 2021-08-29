module.exports = ()=>({
    dev: {
        openHtml: 'index.html',
        proxy: {
            '/api': {
                target: 'http://localhost:6000',
                pathRewrite: {
                    '/api': '/'
                }
            }
        }
    },
    rely: {
        'index.html': [
        ],
        'test/index.html': [
        ]
    }
})
