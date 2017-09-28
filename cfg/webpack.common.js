var path = require('path')
var webpack = require('webpack')

module.exports = {
    output: {
        path: path.resolve(__dirname, '../dist'),
        publicPath: '/dist/',
    },
    node: {
        fs: 'empty',
        net: 'empty',
    },
    module: {
        rules: [{
                test: /.*\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {}
                    // other vue-loader options go here
                }
            },{
                test: /.*\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules|src\/*.js/,
            },{
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]?[hash]'
                }
            },{
                test: /\.styl$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'stylus-loader'
                ]
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    devServer: {
        contentBase: path.join(__dirname, '../src/ui'),
        historyApiFallback: true,
        noInfo: true,
        port: 4000,
    },
    performance: {
        hints: false
    },
    devtool: '#source-map' // allow breakpoint
    //devtool: '#eval-source-map' // dont allow breakpoint  
}

if (process.env.NODE_ENV === 'production') {
    module.exports.devtool = '#source-map'
    // http://vue-loader.vuejs.org/en/workflow/production.html
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        //new webpack.optimize.UglifyJsPlugin({ // DOES NOT SUPPORT ES6 YET
            //sourceMap: true,
            //compress: {
                //warnings: false
            //}
        //}),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ])
}
