module.exports = {
    viewportWidth: 750,
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
            'node_modules/axios/dist/axios.min.js'
        ],
        'test/index.html': [
        ]
    }
}
