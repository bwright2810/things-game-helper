var webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
    entry: ['babel-polyfill', './src/main/typescript/client/client.ts'],
    output: {
        path: __dirname + '/public',
        filename: 'bundle.js',
    },
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        loaders: [{
            test: /\.ts$/, loaders: ['babel-loader', 'ts-loader'], exclude: /node_modules/
        }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['public']),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
}