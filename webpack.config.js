var webpack = require('webpack');
var path    = require('path');
var fs      = require('fs');
var util    = require('util');
var CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Load nodejs environments from .env file
 */


var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = function (options) {
    var babelQuery = {
        cacheDirectory: true,
        presets       : ['es2015', 'stage-0'],
        plugins       : [
            'transform-runtime'
        ]
    };

    var loaders = [
        {
            test   : /\.js$/,
            exclude: /node_modules/,
            loader : 'babel',
            query  : babelQuery
        },
        {
            test  : /route-recognizer[\\\/]/,
            loader: 'babel-loader'
        },
        {
            test  : /\.json$/,
            loader: 'json'
        }
    ];

    var output = {
        path             : path.join(__dirname, "build"),
        filename         : "[name].js" + (options.longTermCaching ? "?[chunkhash]" : ""),
        chunkFilename    : "[name].js" + (options.longTermCaching ? "?[chunkhash]" : ""),
        sourceMapFilename: "debugging/[file].map",
        pathinfo         : options.debug
    };

    var plugins = [
        new CopyWebpackPlugin([
            {from: 'cli/installers/*.*'}
        ]),
        new webpack.optimize.CommonsChunkPlugin({
            name     : "main",
            async    : "async-deps",
            minChunks: 2
        }),
        new webpack.IgnorePlugin(/\.(css|less)$/),
        new webpack.IgnorePlugin(/vertx/),
        new webpack.BannerPlugin(
            'require("source-map-support").install();',
            {
                raw      : true,
                entryOnly: false
            }
        )
    ];

    if (options.minimize) {
        plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: false
            }),
            new webpack.NoErrorsPlugin()
        );
    }

    return {
        entry    : {
            main: ['./cli/index.js']
        },
        target   : 'node',
        output   : output,
        externals: nodeModules,
        plugins  : plugins,
        module   : {
            loaders: loaders
        },
        devtool  : options.devtool || 'sourcemap'
    }
};