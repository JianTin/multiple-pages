module.exports = {
    presets: [
        ["@babel/preset-env", {
            modules: "cjs",
            useBuiltIns: "usage",
            corejs: {
                version: "3.16.2",
                proposals: true
            }
        }],
        ["@babel/preset-react", {
            runtime: "automatic"
        }]
    ],
    plugins: [
        ["@babel/plugin-proposal-decorators", {
            decoratorsBeforeExport: true
        }]
    ]
}