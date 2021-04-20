import webpack from 'webpack';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import VirtualModulesPlugin from 'webpack-virtual-modules';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import RemovePlugin from 'remove-files-webpack-plugin';
import fs from 'fs/promises';
import path from 'path';
import {createRequire} from 'module';
import globPkg from 'glob';
import TerserPlugin from 'terser-webpack-plugin';
import postcssUrl from 'postcss-url';
import got from 'got';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

const git = createRequire(import.meta.url)('git-rev-sync');
const {EnvironmentPlugin, optimize} = webpack;
const {glob} = globPkg;

function convertEmojiToolkitCodePointToChar(codePoint) {
    if (codePoint.includes('-')) {
        return codePoint
            .split('-')
            .map(subCodePoint => convertEmojiToolkitCodePointToChar(subCodePoint))
            .join('');
    }

    const charCode = parseInt(codePoint, 16);
    if (charCode >= 0x10000 && charCode <= 0x10ffff) {
        const high = Math.floor((charCode - 0x10000) / 0x400) + 0xd800;
        const low = ((charCode - 0x10000) % 0x400) + 0xdc00;
        return String.fromCharCode(high) + String.fromCharCode(low);
    }

    return String.fromCharCode(charCode);
}

function jsonTransform(emojis) {
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

export default async(env, argv) => {
    const PROD = argv.mode === 'production';
    const PORT = 2888;
    const PROD_ENDPOINT = 'https://cdn.betterttv.net/';
    const DEV_ENDPOINT = `http://127.0.0.1:${PORT}/`;
    const CDN_ENDPOINT = PROD ? PROD_ENDPOINT : DEV_ENDPOINT;

    const {version} = JSON.parse(await fs.readFile('./package.json'));
    const emotes = JSON.parse(await fs.readFile('./node_modules/emoji-toolkit/emoji.json'));

    return {
        devServer: {
            contentBase: path.resolve('./build'),
            compress: true,
            port: PORT,
            after: app => {
                app.get('*', (req, res) => {
                    got.stream(`${PROD_ENDPOINT}${req.path}`)
                        .on('error', () => res.sendStatus(404))
                        .pipe(res);
                });
            },
        },
        entry: {
            betterttv: './src/index.js',
            css: glob.sync('./src/modules/**/*.css'),
        },
        output: {
            filename: '[name].js',
            path: path.resolve('./build'),
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    loader: path.resolve('./dev/webpack-import-glob.cjs'),
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        postcssUrl({url: asset => `${CDN_ENDPOINT}${asset.url}`}),
                                        'postcss-hexrgba',
                                        'autoprefixer',
                                        'precss',
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
                            plugins: ['@babel/plugin-transform-runtime'],
                        },
                    },
                },
            ],
        },
        optimization: {
            minimize: PROD,
            minimizer: [
                new CssMinimizerPlugin({
                    test: /\.css$/,
                }),
            ],
        },
        plugins: [
            new webpack.BannerPlugin({
                banner: (await fs.readFile('LICENSE')).toString(),
                entryOnly: true,
            }),
            new EnvironmentPlugin({
                DEV_CDN_PORT: PORT,
                DEV_CDN_ENDPOINT: DEV_ENDPOINT,
                PROD_CDN_ENDPOINT: PROD_ENDPOINT,
                EXT_VER: version,
                GIT_REV: git.long(),
                SENTRY_URL: process.env.SENTRY_URL || 'https://24dfd2854f97465da5fb14fcea77278c@sentry.io/144851',
                CDN_ENDPOINT: CDN_ENDPOINT,
            }),
            new optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
            new CopyPlugin({
                patterns: [{from: './src/assets', to: './assets'}],
            }),
            new CleanWebpackPlugin(),
            new RemovePlugin({
                after: {
                    include: ['./build/css.js'],
                },
            }),
            new MiniCssExtractPlugin({
                filename: 'betterttv.css',
            }),
            new VirtualModulesPlugin({
                'src/modules/emotes/emojis-by-slug.json': JSON.stringify(jsonTransform(emotes)),
            }),
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    };
};
