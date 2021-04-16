/* Plugins */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const { EnvironmentPlugin, optimize } = webpack;
const VirtualModulesPlugin = require('webpack-virtual-modules');
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');
const postcssUrl = require('postcss-url');
const fs = require('fs');
const path = require('path');
const { version } = require('./package.json')
const git = require('git-rev-sync');
const url = require('url');
const request = require('request');
const { glob } = require('glob');

const port = 2888
const prod = process.env.NODE_ENV === 'production';
const prodEndpoint = 'https://cdn.betterttv.net/';
const devEndpoint = `http://127.0.0.1:${port}/`;
const cdnEndpoint = prod ? prodEndpoint : devEndpoint

module.exports = () => {

    const emotes = require('emoji-toolkit/emoji');

    return {
        devServer: {
            contentBase: path.resolve(__dirname, './build'),
            compress: false,
            port,
            after: function (app) {
                app.get('*', function (req, res) {
                    const uri = url.parse(req.url).pathname;
                    const file = path.join(process.cwd(), 'build', uri);

                    fs.access(file, (error) => {

                        if (error) {
                            request.get(`${prodEndpoint}${uri}`).pipe(res);
                            return;
                        }
                
                        if (fs.lstatSync(file).isDirectory()) {
                            res.writeHead(403);
                            res.write('403 Forbidden');
                            res.end();
                            return;
                        }
                
                        if (file.endsWith('.svg')) {
                            res.writeHead(200, {
                                'Access-Control-Allow-Origin': '*',
                                'Content-Type': 'image/svg+xml'
                            });
                        } else {
                            res.writeHead(200, {
                                'Access-Control-Allow-Origin': '*'
                            });
                        }
                
                        fs.createReadStream(file).pipe(res);
                    });
                })
            },
        },
        entry: {
            betterttv: path.resolve(__dirname, './src/index.js'),
            css: glob.sync('./src/**/*.css')
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, './build'),
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    loader: path.resolve('./dev/webpack-import-glob'),
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader", 
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        [
                                            postcssUrl({url: asset => `${cdnEndpoint}${asset.url}`}),
                                            'hexrgba',
                                            'autoprefixer',
                                            'precss',
                                        ],
                                    ],
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules)/,
                    use: {
                      loader: 'babel-loader',
                      options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime']
                      }
                    }
                },
            ]
        },
        plugins: [
            new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8') + '\n'),
            new EnvironmentPlugin({
                DEV_CDN_PORT: port,
                DEV_CDN_ENDPOINT: devEndpoint,
                PROD_CDN_ENDPOINT: prodEndpoint,
                EXT_VER: version,
                GIT_REV: git.long(),
                SENTRY_URL: process.env.SENTRY_URL || 'https://24dfd2854f97465da5fb14fcea77278c@sentry.io/144851',
                CDN_ENDPOINT: cdnEndpoint
            }),
            new optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
            new CopyPlugin({
                patterns: [
                    { from: "./src/assets", to: "./assets" },
                ],
            }),
            new CleanWebpackPlugin(),
            new RemovePlugin({
                after: {
                    include: [
                        './build/css.js',
                    ]
                }
            }),
            new MiniCssExtractPlugin({
                filename: "betterttv.css",
            }),
            new VirtualModulesPlugin({
                'src/modules/emotes/emojis-by-slug.json': JSON.stringify(jsonTransform(emotes)),
            }),
        ]
    }
};

function jsonTransform (emojis) {
    const result = {};
    for (const emojiData of Object.values(emojis)) {
        const char = convertEmojiToolkitCodePointToChar(emojiData.code_points.fully_qualified);
        const data = {
            char,
            slug: emojiData.shortname.replace(/:/g, ''),
        };
        result[data.slug] = data;
        for (const alternativeShortName of emojiData.shortname_alternates) {
            result[alternativeShortName.replace(/:/g, '')] = data;
        }
    }
    return result;
}

function convertEmojiToolkitCodePointToChar(codePoint) {
    if (codePoint.includes('-')) {
        return codePoint.split('-')
            .map(subCodePoint => convertEmojiToolkitCodePointToChar(subCodePoint))
            .join('');
    }

    const charCode = parseInt(codePoint, 16);
    if (charCode >= 0x10000 && charCode <= 0x10FFFF) {
        const high = Math.floor((charCode - 0x10000) / 0x400) + 0xD800;
        const low = ((charCode - 0x10000) % 0x400) + 0xDC00;
        return (String.fromCharCode(high) + String.fromCharCode(low));
    }

    return String.fromCharCode(charCode);
}