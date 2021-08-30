module.exports = {
    dev: {
        openHtml: 'index.html',
        // proxy: {
        //     '/api': {
        //         target: 'http://localhost:6000',
        //         pathRewrite: {
        //             '/api': '/'
        //         }
        //     }
        // }
    },
    // base: 全部HTML
    // 无base: 单独HTML
    // rely: 将在打包时，往html页面注入，<script></script> 可以随自己需要更改
    baseCss: [
        'node_modules/normalize.css/normalize.css' // 去除默认样式
    ],
    baseRely: [
        'node_modules/babel-polyfill/dist/polyfill.min.js', // 注入polyfill 兼容低版本浏览器，具体配置参考文档
        'node_modules/jquery/dist/jquery.min.js'
    ],
}
