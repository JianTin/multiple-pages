# rough-multiple-pages
___
一个使用 **gulp** 构建的项目初始化工具。  
倾向于使用原生 html + css (less) + js 去开发页面。如果需要依赖于 vue / react 那可能不太适合。  

    npx rough-multiple-pages [appName]  
##### 理由
一些简单的页面，并不需要依赖于 react / vue 这些框架，这样反而造成的页面加载速度慢。  
例如：只需要开发简单的活动页（线上时间 只是几天的时间），这些页面往往比较简单。借用 react / vue 可能使得你开发更熟练、更快（webpack的基础上），但是有可能造成页面加载缓慢。
##### 做到了什么
- 具有类似 webpack 的 devserver。**代码保存 将 刷新浏览器**。支持 proxy 代理 方便与服务端交互。
- 将会把 ES6 -> ES5 以支持低版本浏览器。压缩 js 
- 支持less、css文件。less -> css，css + 兼容性前缀。压缩 css
- 可配置 移动端兼容 选项，以特定的 设计稿尺寸 对你的 px 做处理。
- 保证文件夹结构，不做多余处理
#### 不好的地方
不支持 umd 模式，也就是 不能在js文件内 import / require 。  
这对于使用 npm 管理包工具是弊端的，我这边提供了 init.config.js 可以配置允许 window 注入的js包。  
如 jquery、axios、lodash。。。这些比较著名的库

###### 添加库的多种方法
依靠cdn

    <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js'></script>
    </body>

init.config.js 配置  
（需要保证 npm i jquery，html 结构）  
作用： 会在打包时（ dev / build ），往 **全部 html** 生成 <script src=' 相对dist/baseRely/jquery.min.js' ...。  
该jquery包会被打包到 dist/baseRely 文件夹中。**前提 遵守 html 结构**

        baseRely: ['node_modules/jquery/dist/jquery.min.js']
只对 src/index.html 页面注入 jquery

    rely: {
        'index.html': ['node_modules/jquery/dist/jquery.min.js']
    }

###### less 和 css
less和css，需要保证不同名。html引入less文件，需要将less扩展名修改为css

## html 结构
___
在该结构上面开发。不要去修改  <!-- relyLink --> 和  <!-- polyfill and npmModule -->  
`<link />` 标签，需要跟在  <!-- relyLink -->  后面。  
`<Script... >` 标签，需要跟在 <!--polyfill and npmModule--> 后面  
占位符 是会被程序 替换为 baseRely / baseCss / rely 所指向的模块文件  

            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <!-- relyLink -->
            </head>
            <body>
                <!-- polyfill and npmModule -->
            </body>
            </html>

## init.config.js
___
init.config.js 用户配置文件，可以前往 根目录 。进行覆盖 / 删除。**需要看 html 结构！！**

    {
        outputName: 'dist',
        compileSrc: 'src',
        viewportWidth: false,
        dev: {
            openHtml: 'index.html',
            proxy: []
        },
        // 开发环境下，修改以下配置。不需要重启服务。
        baseCss: [
            'node_modules/normalize.css/normalize.css'
        ],
        baseRely: [
            'node_modules/babel-polyfill/dist/polyfill.min.js',
            'node_modules/jquery/dist/jquery.min.js'
        ],
        rely: {}
    }
- `outputName: string` ---- 打包生成的目录名
- `compileSrc: string` ---- 编译的目录, 根目录 + compileSrc
- `viewportWidth: false | number` ---- 是否兼容移动端，可以填写设计稿尺寸
- `dev: object` ---- 配置开发服务对象
    - `openHtml: string` ---- 根目录 + compuleSrc + openHhtml，开发服务打开的页面
    - `proxy: Array` ---- 配置请求代理，由开发服务 帮助 转发
- `baseCss: Array` ---- 全部 html 将会把 <!-- relyLink -->占位符 转化为 `<link src='./baseRely/...css' />`
- `baseRely: Array` ---- 全部 html 将会把 <!-- polyfill and npmModule --> 占位符 转化为 `<script src='./baseRely/...js' />`
- `rely: object` --- 不同于 base 将会在特定的 html 内做 模块引用

#### 例子
##### proxy
将会把你的请求 /api/getInfo -> http://localhost:6000/getInfo

    proxy: {
        '/api': {
            target: 'http://localhost:6000', // 可以跟换为后端的服务的域名
            pathRewrite: {
                '/api': '/'
            }
        }
    }

##### baseRely、baseCss、rely
通过配置 npm i 下载的包，指向 具有window注入的文件。  
base: 代表，会在全部文件中引入。  
baseRely
    
    baseRely: ['node_modules/axios/dist/axios.min.js', 'node_modules/axios/dist/jquery.min.js']
- axios: node_modules/axios/dist/axios.min.js
- jquery:  node_modules/axios/dist/jquery.min.js

将会在打包时，对他们进行 复制 到dist/baseRely 文件夹内。    
并且 html 文件，会生成 <script> 相对路径指向 dist/baseRely 内的 文件。  
文件是对 <!-- polyfill and npmModule --> 的替换  
rely
只对某个html文件引入js 模块文件。完整路径：src + rely[key]

    rely: {
        'index.html': ['node_modules/axios/dist/axios.min.js']
    }

baseCss
    效果和baseRely一样，不过没有单独的 relyCss。  
    会找到 html 内的 <!-- relyLink --> ，进行替换。生成 <link ...  
##### viewportWidth
根据750px的设计稿，对你的 cssPx 尺寸做更改。

    viewportWidth: 750
    







