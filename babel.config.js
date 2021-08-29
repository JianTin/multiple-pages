module.exports = {
    presets: [
        ["@babel/preset-env", {
            modules: "cjs",
            useBuiltIns: false
        }]
    ],
    plugins: [
        ["@babel/plugin-proposal-decorators", {
            decoratorsBeforeExport: true
        }]
    ]
}