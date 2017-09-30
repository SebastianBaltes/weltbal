"use strict";

const webpack = require("webpack");
const path = require('path');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const failPlugin = require('webpack-fail-plugin');
const autoprefixer = require('autoprefixer');

module.exports = function(env) {

    env = env==null ? {} : env;

    const PRODUCTION = env.production;

    if (PRODUCTION) {
        console.log('*** PRODUCTION BUILD ***');
    }

    const resolve = (module) => require.resolve(module);

    const config = {
        entry: {
            app: [
                // Set up an ES6-ish environment
                'babel-polyfill',
                // the real main script
                "./src/index.js",
            ],
        },

        devServer: {
            https: true,
            host: '0.0.0.0',
            inline: true,
            disableHostCheck: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        },
        target: "web",

        // PRODUCTION: PRODUCTION,
        // ES5: ES5,
        output: {
            path: path.join(__dirname, 'build'),
            filename: "[name].bundle.js",
        },

        resolve: {

            modules: [
                path.join(__dirname, "node_modules"),
            ],

            mainFields: ["main", "browser"],

            alias: {
                // benötigt wegen warning appRequireContext.extensions is not supported by webpack. Use a loader instead.
                'handlebars': 'handlebars/dist/handlebars.js',
                // benötigt wegen Uncaught TypeError: inherits is not a function
                'inherits': 'inherits/inherits_browser.js',
            },
        },
        devtool: 'source-map',
        resolveLoader: {
            moduleExtensions: ["-loader"],
        },
        module: {
            loaders: [
                {
                    test: /\.json$/,
                    loader: 'json'
                },
                {
                    test: /\.hbs$/,
                    loader: "raw"
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: "css-loader!resolve-url"
                    })
                },
                {
                    test: /\.scss$/,
                    loader: ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            'css-loader?sourceMap=true',
                            'postcss-loader?sourceMap=true',
                            'resolve-url-loader',
                            'sass-loader?sourceMap=true',
                        ],
                    }),
                },
                {
                    test: /\.(gif|svg)$/i,
                    loaders: [
                        'url-loader?limit=10000&hash=sha512&digest=hex&name=[hash].[ext]',
                    ]
                },
                {
                    test: /\.(jpe?g|png)(\?.*)?$/i,
                    loaders: [
                        'url-loader?limit=10000&hash=sha512&digest=hex&name=[hash].[ext]',
                    ]
                },
                {
                    test: /\.woff(2)?(\?.*)?$/,
                    loader: "url-loader?limit=10000&mimetype=application/font-woff"
                },
                {
                    test: /\.(ttf|eot)(\?.*)?$/,
                    loader: "url-loader?limit=10000"
                },
                {
                    test: /.*\.js$/,
                    loader: 'babel-loader',
                    exclude: /node_modules/,
                    query: {
                        babelrc: false,
                        presets: PRODUCTION ? [resolve('babel-preset-es2015')] : undefined,
                        plugins: PRODUCTION
                            ? [
                                resolve('babel-plugin-transform-runtime'),
                                resolve('babel-plugin-transform-class-properties'),
                                resolve('babel-plugin-transform-decorators'),
                                resolve('babel-plugin-transform-flow-strip-types'),
                                resolve('babel-plugin-transform-object-rest-spread'),
                            ]
                            : [
                                resolve('babel-plugin-transform-es2015-modules-commonjs'),
                                resolve('babel-plugin-transform-class-properties'),
                                resolve('babel-plugin-transform-decorators'),
                                resolve('babel-plugin-typecheck'),
                                resolve('babel-plugin-syntax-flow'),
                                resolve('babel-plugin-transform-flow-strip-types'),
                                resolve('babel-plugin-transform-object-rest-spread'),
                            ],
                    }
                }
            ]
        },
        plugins: [
            // Webpack plugin that will make the process return status code 1 when it finishes with errors in single-run mode.
            failPlugin,
            // erzeugt style.css als separate Datei, sonst würde der Style im JS-Code stehen
            new ExtractTextPlugin({
                filename: "[name].bundle.css",
            }),
            // stellt einige Module global zur Verfügung, so dass man keinen Import schreiben muss
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                _: 'lodash',
                // THREE: 'three' --- führt zu Fehler, weil aframe eine eigene Version benutzt
            }),
            new webpack.EnvironmentPlugin({
                NODE_ENV: PRODUCTION ? 'production' : 'development'
            }),
            new HtmlWebpackPlugin({
                template: 'index.html',
                filename: 'index.html',
                inject: 'head',
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "vendor",
                // (the commons chunk name)
              
                filename: "vendor.js",
                minChunks: (module) => {
                    return /node_modules/.test(module.resource)
                },
                // (the filename of the commons chunk)
              
                // minChunks: 3,
                // (Modules must be shared between 3 entries)
              
                // chunks: ["pageA", "pageB"],
                // (Only use these entries)
            }),
        ],
    };

    if (PRODUCTION) {

        config.plugins = config.plugins.concat([
            new CleanWebpackPlugin([config.output.path], {verbose: true, allowExternal: true}),
            new Webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false,
                quiet: true
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    screw_ie8: true,
                    conditionals: true,
                    unused: true,
                    comparisons: true,
                    sequences: true,
                    dead_code: true,
                    evaluate: true,
                    if_return: true,
                    join_vars: true,
                },
                output: {
                    comments: false
                },
                sourceMap: true
            }),
        ]);

    } else {

        // beseitigt Fehler bei webpack-dev-server --inline
        config.node = {
            "fs": "empty",
            "net": "empty",
            "tls": "empty",
            "debug": "empty",
        };
    }

    return config;
};


