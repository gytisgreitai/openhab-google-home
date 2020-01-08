const path = require('path');
module.exports =  {
    entry: './index.ts',
    target: "node",
    devtool: 'none',
    mode: 'production',
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: 'index-nodeps.js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '../node_modules')
        ],
    },
    optimization: {
        minimize: false,
        nodeEnv: false
    },
    module: {
        rules: [
        {
            use: 'ts-loader',
            test: /\.ts?$/
        }
        ]
    },
    node: {
        __dirname: false
    }
}