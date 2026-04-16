import fs from 'fs/promises';
import {createRequire} from 'module';
import path from 'path';
import {sentryWebpackPlugin} from '@sentry/webpack-plugin';
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import dotenv from 'dotenv';
import FileManagerPlugin from 'filemanager-webpack-plugin';

import {globSync} from 'glob';
// eslint-disable-next-line import/no-unresolved
import got from 'got';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import normalizePath from 'normalize-path';
import postcssPrefixwrap from 'postcss-prefixwrap';
import postcssUrl from 'postcss-url';
import RemovePlugin from 'remove-files-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import VirtualModulesPlugin from 'webpack-virtual-modules';

dotenv.config();

const git = createRequire(import.meta.url)('git-rev-sync');
const {EnvironmentPlugin, optimize} = webpack;

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
  const API_ENDPOINT = process.env.API_ENDPOINT ?? `https://api.betterttv.net`;
  const API_VERSION = process.env.API_VERSION ?? '3';
  // TODO: update fallback id to official client id
  const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID ?? '69df8fd87facce5d303ec889';
  const OAUTH2_REDIRECT_URI = process.env.OAUTH2_REDIRECT_URI ?? 'https://betterttv.com/extension/callback';
  const SOCKET_ENDPOINT = process.env.SOCKET_ENDPOINT ?? 'wss://sockets.betterttv.net/ws';

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
      headers: {
        'Access-Control-Allow-Origin': '*',
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

        return middlewares.filter((middleware) => middleware.name !== 'cross-origin-header-check');
      },
    },
    entry: {
      betterttv: [
        ...globSync('./src/modules/**/*.css', {dotRelative: true})
          .filter((filename) => !filename.endsWith('.module.css'))
          .map((filename) => normalizePath(filename)),
        './node_modules/@mantine/core/styles.css',
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
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  auto: true,
                  namedExport: false,
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
                    postcssPrefixwrap(':where(.bttv-mantine-scope)', {
                      prefixRootTags: false,
                      whitelist: [/[/\\]@mantine[/\\]core[/\\]styles\.css$/],
                      ignoredSelectors: [/^:host/],
                    }),
                    'postcss-hexrgba',
                    'autoprefixer',
                  ],
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
              plugins: [
                'wildcard',
                '@babel/plugin-transform-runtime',
                [
                  'formatjs',
                  {
                    idInterpolationPattern: '[sha512:contenthash:base64:6]',
                    ast: true,
                    preserveWhitespace: true,
                  },
                ],
              ],
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
        API_ENDPOINT,
        API_VERSION,
        EXT_VER: version,
        GIT_REV: process.env.GIT_REV || git.long(),
        SENTRY_URL:
          process.env.SENTRY_URL || 'https://718271c7e5456d1b5e40dabeb9b257ab@o23210.ingest.us.sentry.io/5730387',
        CDN_ENDPOINT,
        OAUTH2_CLIENT_ID,
        OAUTH2_REDIRECT_URI,
        SOCKET_ENDPOINT,
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
        ignoreOrder: true,
      }),
      new VirtualModulesPlugin({
        'src/modules/emotes/emojis-by-slug.json': JSON.stringify(jsonTransform(emotes)),
      }),
      new TerserPlugin({
        extractComments: false,
      }),
      ...(process.env.GITHUB_TAG || process.env.GIT_REV
        ? [
            sentryWebpackPlugin({
              authToken: process.env.GITHUB_TAG != null ? process.env.SENTRY_AUTH_TOKEN : undefined,
              release: {
                name: process.env.GIT_REV || git.long(),
              },
              org: 'nightdev',
              project: 'betterttv-extension',
              sourcemaps: {
                include: ['./build'],
                ignore: ['dev', 'node_modules', 'webpack.config.js'],
              },
              telemetry: false,
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
