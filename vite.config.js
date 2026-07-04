import {exec} from 'child_process';
import fs from 'fs/promises';
import http from 'http';
import {createRequire} from 'module';
import path from 'path';
import {promisify} from 'util';
import formatjs from '@formatjs/unplugin/vite';
import {sentryVitePlugin} from '@sentry/vite-plugin';
import autoprefixer from 'autoprefixer';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import got from 'got';
import {Features} from 'lightningcss';
import postcssHexrgba from 'postcss-hexrgba';
import postcssPrefixwrap from 'postcss-prefixwrap';
import postcssPresetEnv from 'postcss-preset-env';
import postcssUrl from 'postcss-url';
import {defineConfig} from 'vite';

const require = createRequire(import.meta.url);
const git = require('git-rev-sync');
const execAsync = promisify(exec);

const PORT = 2888;
const PROD_ENDPOINT = 'https://cdn.betterttv.net';
const DEV_ENDPOINT = `http://127.0.0.1:${PORT}`;

function gitRev() {
  try {
    return process.env.GIT_REV || git.long();
  } catch {
    return process.env.GIT_REV || 'unknown';
  }
}

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

// Generates src/modules/emotes/emojis-by-slug.json on the fly as a virtual module.
function emojisVirtualModulePlugin() {
  const VIRTUAL_ID = '\0bttv-emojis-by-slug';
  let json;
  return {
    name: 'bttv-emojis-by-slug',
    async resolveId(id, importer) {
      if (id.endsWith('emojis-by-slug.json') && importer?.replace(/\\/g, '/').includes('modules/emotes')) {
        return VIRTUAL_ID;
      }
      return null;
    },
    async load(id) {
      if (id !== VIRTUAL_ID) return null;
      if (json == null) {
        const emojis = JSON.parse(await fs.readFile('./node_modules/emoji-toolkit/emoji.json', 'utf8'));
        json = JSON.stringify(jsonTransform(emojis));
      }
      return `export default ${json};`;
    },
  };
}

// Copies src/assets -> build/assets after the bundle is written.
function copyAssetsPlugin() {
  return {
    name: 'bttv-copy-assets',
    apply: 'build',
    async closeBundle() {
      await fs.cp('src/assets', 'build/assets', {recursive: true});
    },
  };
}

// Produces build/betterttv.tar.gz on tagged release builds, with entries at the archive root
// (assets/, betterttv.js, ...) to match the published artifact's layout.
function releaseArchivePlugin() {
  return {
    name: 'bttv-release-archive',
    apply: 'build',
    async closeBundle() {
      if (!process.env.GITHUB_TAG) return;
      await execAsync('tar -czf betterttv.tar.gz --exclude=betterttv.tar.gz *', {cwd: 'build'});
    },
  };
}

const MIME_TYPES = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.map': 'application/json',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

const RELOAD_PATH = '/__bttv_dev_reload';

// Snippet appended to the dev bundle: subscribes to the reload stream and refreshes the page after
// each rebuild.
const RELOAD_CLIENT = `;(function(){try{var s=new EventSource(${JSON.stringify(
  DEV_ENDPOINT + RELOAD_PATH
)});s.onmessage=function(){location.reload()};}catch(e){}})();`;

// In `vite build --watch` (npm start), serves the freshly built single-file bundle at
// http://127.0.0.1:2888/betterttv.js, falls back to the production CDN for anything not built
// locally, and pushes a reload after each rebuild.
function devWatchServerPlugin() {
  let isWatch = false;
  let started = false;
  const clients = new Set();

  return {
    name: 'bttv-dev-watch-server',
    apply: 'build',
    configResolved(config) {
      isWatch = config.build.watch != null;
    },
    // append the reload client to the entry chunk so a rebuild refreshes the page. The leading
    // newline is required: the chunk ends with a `//# sourceMappingURL=` line comment, so without
    // it the client would be commented out.
    generateBundle(_options, bundle) {
      if (!isWatch) return;
      const chunk = bundle['betterttv.js'];
      if (chunk?.type === 'chunk') {
        chunk.code += `\n${RELOAD_CLIENT}`;
      }
    },
    buildStart() {
      if (!isWatch || started) return;
      started = true;

      const server = http.createServer((req, res) => {
        const url = (req.url ?? '/').split('?')[0];
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (url === RELOAD_PATH) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          });
          res.write('\n');
          clients.add(res);
          req.on('close', () => clients.delete(res));
          return;
        }

        const relative = url === '/' ? 'betterttv.js' : url.replace(/^\//, '');
        const buildDir = path.resolve('build');
        const filePath = path.resolve(buildDir, relative);
        // guard against path traversal escaping the build directory
        if (filePath !== buildDir && !filePath.startsWith(buildDir + path.sep)) {
          res.statusCode = 403;
          res.end();
          return;
        }
        // serve the locally built file if present, otherwise proxy to the production CDN
        fs.readFile(filePath)
          .then((data) => {
            res.writeHead(200, {'Content-Type': MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream'});
            res.end(data);
          })
          .catch(() => {
            got
              .stream(`${PROD_ENDPOINT}/${relative}`)
              .on('error', () => {
                res.statusCode = 404;
                res.end();
              })
              .pipe(res);
          });
      });

      server.listen(PORT, () => {
        console.log(`\n  BetterTTV dev server: ${DEV_ENDPOINT}/betterttv.js (watching for changes)\n`);
      });
    },
    // fired after each (re)build writes the bundle to disk
    writeBundle() {
      if (!isWatch) return;
      for (const res of clients) {
        res.write('data: reload\n\n');
      }
    },
  };
}

export default defineConfig(async ({mode}) => {
  const prod = mode === 'production';
  const CDN_ENDPOINT = prod ? PROD_ENDPOINT : DEV_ENDPOINT;
  const API_ENDPOINT = process.env.API_ENDPOINT ?? 'https://api.betterttv.net';
  const API_VERSION = process.env.API_VERSION ?? '3';
  const OAUTH2_CLIENT_ID = process.env.OAUTH2_CLIENT_ID ?? '69df8fd87facce5d303ec889';
  const OAUTH2_REDIRECT_URI = process.env.OAUTH2_REDIRECT_URI ?? 'https://betterttv.com/extension/callback';
  const SOCKET_ENDPOINT = process.env.SOCKET_ENDPOINT ?? 'wss://sockets.betterttv.net/ws';

  const {version} = JSON.parse(await fs.readFile('./package.json', 'utf8'));
  const license = await fs.readFile('LICENSE', 'utf8');

  const env = {
    NODE_ENV: prod ? 'production' : 'development',
    DEV_CDN_PORT: PORT,
    DEV_CDN_ENDPOINT: DEV_ENDPOINT,
    PROD_CDN_ENDPOINT: PROD_ENDPOINT,
    API_ENDPOINT,
    API_VERSION,
    EXT_VER: version,
    GIT_REV: gitRev(),
    SENTRY_URL: process.env.SENTRY_URL || 'https://718271c7e5456d1b5e40dabeb9b257ab@o23210.ingest.us.sentry.io/5730387',
    CDN_ENDPOINT,
    OAUTH2_CLIENT_ID,
    OAUTH2_REDIRECT_URI,
    SOCKET_ENDPOINT,
  };

  return {
    define: Object.fromEntries(
      Object.entries(env).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
    ),
    resolve: {
      // '@' maps to src/ so non-sibling imports avoid ../../.. chains
      alias: {'@': path.resolve('src')},
    },
    // JSX lives in .jsx files; use the classic runtime since every JSX file imports React
    oxc: {
      jsx: {runtime: 'classic'},
    },
    css: {
      modules: {
        generateScopedName: 'bttv-[name]__[local]-[hash:base64:5]',
      },
      postcss: {
        plugins: [
          postcssUrl({
            url: (asset) =>
              asset.url.startsWith(CDN_ENDPOINT) ? asset.url : `${CDN_ENDPOINT}/${asset.url.replace(/^\/+/, '')}`,
          }),
          postcssPrefixwrap(':where(.bttv-mantine-scope)', {
            prefixRootTags: false,
            whitelist: [/[/\\]@mantine[/\\]core[/\\]styles\.css$/],
            ignoredSelectors: [/^:host/],
          }),
          postcssHexrgba(),
          autoprefixer(),
          postcssPresetEnv(),
        ],
      },
      lightningcss: {
        // We use postcss preset env to handle browser compatibility due to bugs in lightningcss, so we can safely disable it here
        exclude: Object.values(Features).reduce((acc, feature) => acc | feature, 0),
      },
    },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      // the extension intentionally ships as one large self-executing bundle
      chunkSizeWarningLimit: 12000,
      target: browserslistToEsbuild(),
      cssCodeSplit: false,
      sourcemap: prod ? 'hidden' : true,
      minify: prod,
      cssMinify: prod,
      rollupOptions: {
        // IIFE output forces codeSplitting: false, so the whole graph lands in one self-executing
        // file.
        input: path.resolve('src/index.js'),
        output: {
          format: 'iife',
          banner: `/*!\n${license}\n*/`,
          // keep the license banner through minification (rolldown drops legal comments otherwise)
          comments: {legal: true},
          entryFileNames: 'betterttv.js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.names?.[0] ?? assetInfo.name ?? '';
            return name.endsWith('.css') ? 'betterttv.css' : 'assets/[name][extname]';
          },
        },
      },
    },
    plugins: [
      formatjs({
        idInterpolationPattern: '[sha512:contenthash:base64:6]',
        ast: true,
        preserveWhitespace: true,
        // extract (which produced the translation keys) does not flatten, so neither do we
        flatten: false,
      }),
      emojisVirtualModulePlugin(),
      copyAssetsPlugin(),
      releaseArchivePlugin(),
      devWatchServerPlugin(),
      ...(process.env.GITHUB_TAG || process.env.GIT_REV
        ? [
            sentryVitePlugin({
              authToken: process.env.GITHUB_TAG != null ? process.env.SENTRY_AUTH_TOKEN : undefined,
              org: 'nightdev',
              project: 'betterttv-extension',
              release: {
                name: gitRev(),
              },
              sourcemaps: {
                assets: ['./build/**'],
                ignore: ['dev', 'node_modules', 'vite.config.js'],
              },
              telemetry: false,
            }),
          ]
        : []),
    ],
  };
});
