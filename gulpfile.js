const autoprefixer = require('autoprefixer');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const concat = require('gulp-concat');
const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const git = require('git-rev-sync');
const {src, dest, series, parallel, watch} = require('gulp');
const gulpif = require('gulp-if');
const gzip = require('gulp-gzip');
const header = require('gulp-header');
const hexrgba = require('postcss-hexrgba');
const postcss = require('gulp-postcss');
const postcssUrl = require('postcss-url');
const precss = require('precss');
const rename = require('gulp-rename');
const saveLicense = require('uglify-save-license');
const server = require('./dev/server');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const tar = require('gulp-tar');
const uglify = require('gulp-uglify');
const jsonTransform = require('gulp-json-transform');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = process.env.NODE_ENV === 'production';

process.env.DEV_CDN_PORT = 2888;
process.env.DEV_CDN_ENDPOINT = `http://127.0.0.1:${process.env.DEV_CDN_PORT}/`;
process.env.PROD_CDN_ENDPOINT = 'https://cdn.betterttv.net/';

process.env.EXT_VER = require('./package.json').version;
process.env.GIT_REV = git.long();
process.env.SENTRY_URL = process.env.SENTRY_URL || 'https://24dfd2854f97465da5fb14fcea77278c@sentry.io/144851';
process.env.CDN_ENDPOINT = IS_PROD ? process.env.PROD_CDN_ENDPOINT : process.env.DEV_CDN_ENDPOINT;

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

const LICENSE = `/** @license
 * ${fs.readFileSync('LICENSE').toString().replace(/\n/g, '\n * ')}
 */
`;

const cleanup = () => del('build/**/*');

const lint = () => src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());

const prepare = () => src('src/**/*')
    .pipe(dest('build'));

const license = () => src('build/index.js')
    .pipe(header(LICENSE + '\n'))
    .pipe(dest('build'));

const css = () => src('src/**/*.css')
    .pipe(postcss([
        precss,
        autoprefixer,
        hexrgba,
        postcssUrl({url: asset => `${process.env.CDN_ENDPOINT}${asset.url}`})
    ]))
    .pipe(concat('betterttv.css'))
    .pipe(dest('build'));

const emojisBySlug = () => src('node_modules/emoji-toolkit/emoji.json')
    .pipe(jsonTransform(emojis => {
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
    }))
    .pipe(rename('emojis-by-slug.json'))
    .pipe(dest('build/modules/emotes'));

const scripts = () => browserify('build/index.js', {debug: true})
    .transform('require-globify')
    .transform('babelify', {
        global: true,
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-transform-runtime'],
        ignore: [/node_modules/]
    })
    .transform('envify')
    .bundle()
    .pipe(gulpif(IS_PROD, source('betterttv.unmin.js'), source('betterttv.js')))
    .pipe(buffer())
    .pipe(dest('build'))
    .pipe(gulpif(IS_PROD, rename('betterttv.js')))
    .pipe(gulpif(IS_PROD, sourcemaps.init({loadMaps: true})))
    .pipe(gulpif(IS_PROD, uglify({output: {comments: saveLicense}})))
    .pipe(gulpif(IS_PROD, sourcemaps.write('./')))
    .pipe(gulpif(IS_PROD, dest('build')));

const dist = () => src('build/**/*')
    .pipe(tar('betterttv.tar'))
    .pipe(gzip())
    .pipe(dest('dist'));

const build = series(
    parallel(cleanup, lint),
    prepare,
    emojisBySlug,
    parallel(license, css),
    scripts
);

const devServer = () => {
    server();
    watch('src/**/*', build);
};

exports.default = build;
exports.dist = series(build, dist);
exports.watch = parallel(devServer, build);
