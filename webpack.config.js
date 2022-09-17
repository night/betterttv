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
// eslint-disable-next-line import/no-unresolved
import got from 'got';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import SentryWebpackPlugin from '@sentry/webpack-plugin';
import FileManagerPlugin from 'filemanager-webpack-plugin';

const git = createRequire(import.meta.url)('git-rev-sync');
const {EnvironmentPlugin, optimize} = webpack;
const {glob} = globPkg;

function convertEmojiToolkitCodePointToChar(codePoint) {
  if (codePoint.includes('-')) {
    return codePoint
      .split('-')
      .map((subCodePoint) => convertEmojiToolkitCodePointToChar(subCodePoint))
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
      category: emojiData.category,
    };

    result[data.slug] = data;

    for (const alternativeShortName of emojiData.shortname_alternates) {
      // :tf: is a legacy betterttv global emote
      if (alternativeShortName === ':tf:') {
        continue;
      }

      result[alternativeShortName.replace(/:/g, '')] = {
        ...data,
        isAlternative: true,
      };
    }
  }

  return result;
}

export default async (env, argv) => {
  const PROD = argv.mode === 'production';
  const PORT = 2888;
  const PROD_ENDPOINT = 'https://cdn.betterttv.net/';
  const DEV_ENDPOINT = `http://127.0.0.1:${PORT}/`;
  const CDN_ENDPOINT = PROD ? PROD_ENDPOINT : DEV_ENDPOINT;

  const {version} = JSON.parse(await fs.readFile('./package.json'));
  const emotes = JSON.parse(await fs.readFile('./node_modules/emoji-toolkit/emoji.json'));

  return {
    devServer: {
      port: PORT,
      allowedHosts: ['127.0.0.1', '.twitch.tv', '.youtube.com'],
      devMiddleware: {
        writeToDisk: true,
      },
      static: {
        directory: path.resolve('./build'),
      },
      client: {
        webSocketURL: {
          hostname: '127.0.0.1',
          protocol: 'ws',
        },
      },
      setupMiddlewares: (middlewares) => {
        middlewares.push((req, res) =>
          got
            .stream(`${PROD_ENDPOINT}${req.path}`)
            .on('error', () => res.sendStatus(404))
            .pipe(res)
        );

        return middlewares;
      },
    },
    entry: {
      betterttv: [
        ...glob.sync('./src/modules/**/*.@(css|less)').filter((filename) => !filename.endsWith('.module.css')),
        './src/index.js',
      ],
    },
    output: {
      filename: '[name].js',
      path: path.resolve('./build'),
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          loader: path.resolve('./dev/webpack-import-glob.cjs'),
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                symbolId: 'icon-[name]',
              },
            },
          ],
        },
        {
          test: /(\.less|\.css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  localIdentName: 'bttv-[name]__[local]-[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    postcssUrl({
                      url: (asset) => (asset.url.startsWith(CDN_ENDPOINT) ? asset.url : `${CDN_ENDPOINT}${asset.url}`),
                    }),
                    'postcss-hexrgba',
                    'autoprefixer',
                    'precss',
                  ],
                },
              },
            },
            {
              loader: 'less-loader',
              options: {
                lessOptions: {
                  javascriptEnabled: true,
                  modifyVars: {'@reset-import': false},
                },
              },
            },
          ],
        },
        {
          test: /\.m?(js|jsx)$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/react', '@babel/preset-env'],
              plugins: ['wildcard', '@babel/plugin-transform-runtime'],
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
    devtool: PROD ? 'hidden-source-map' : 'eval',
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
        GIT_REV: process.env.GIT_REV || git.long(),
        SENTRY_URL:
          process.env.SENTRY_URL || 'https://b289038a9b004560bcb58396066ee847@o23210.ingest.sentry.io/5730387',
        CDN_ENDPOINT,
      }),
      new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new CopyPlugin({
        patterns: [{from: 'src/assets', to: './assets'}],
      }),
      new CleanWebpackPlugin(),
      new RemovePlugin({
        after: {
          include: ['./build/css.js', './build/css.js.map'],
        },
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new VirtualModulesPlugin({
        'src/modules/emotes/emojis-by-slug.json': JSON.stringify(jsonTransform(emotes)),
      }),
      new TerserPlugin({
        extractComments: false,
      }),
      ...(process.env.GITHUB_TAG || process.env.GIT_REV
        ? [
            new SentryWebpackPlugin({
              authToken: process.env.SENTRY_AUTH_TOKEN,
              release: process.env.GIT_REV || git.long(),
              org: 'nightdev',
              project: 'betterttv-extension',
              include: './build',
              ignore: ['dev', 'node_modules', 'webpack.config.js'],
              dryRun: process.env.GITHUB_TAG == null,
            }),
          ]
        : []),
      ...(process.env.GITHUB_TAG
        ? [
            new FileManagerPlugin({
              events: {
                onEnd: {
                  archive: [
                    {
                      source: 'build',
                      destination: './build/betterttv.tar.gz',
                      format: 'tar',
                      options: {
                        gzip: true,
                      },
                    },
                  ],
                },
              },
            }),
          ]
        : []),
    ],
  };
};
