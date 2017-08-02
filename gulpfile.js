const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const git = require('git-rev-sync');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gzip = require('gulp-gzip');
const header = require('gulp-header');
const rename = require('gulp-rename');
const saveLicense = require('uglify-save-license');
const server = require('./dev/server');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const tar = require('gulp-tar');
const uglify = require('gulp-uglify');

process.env.EXT_VER = require('./package.json').version;
process.env.GIT_REV = git.long();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.SENTRY_URL = process.env.SENTRY_URL || 'https://24dfd2854f97465da5fb14fcea77278c@sentry.io/144851';

const IS_PROD = process.env.NODE_ENV === 'production';
const LICENSE = `/** @license
 * ${fs.readFileSync('LICENSE').toString().replace(/\n/g, '\n * ')}
 */
`;

gulp.task(
    'cleanup',
    () => del('build/**/*')
);

gulp.task(
    'lint',
    () => gulp.src('src/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
);

gulp.task(
    'prepare',
    ['cleanup', 'lint'],
    () => gulp.src('src/**/*')
        .pipe(gulp.dest('build/'))
);

gulp.task(
    'license',
    ['prepare'],
    () => gulp.src('build/index.js')
        .pipe(header(LICENSE + '\n'))
        .pipe(gulp.dest('build'))
);

gulp.task(
    'scripts',
    ['license'],
    () => browserify('build/index.js', {debug: true})
        .transform('require-globify')
        .transform('babelify', {
            global: true,
            presets: ['es2015'],
            plugins: ['transform-runtime'],
            ignore: /node_modules\/(?!draggy)/
        })
        .transform('envify')
        .bundle()
        .pipe(gulpif(IS_PROD, source('betterttv.unmin.js'), source('betterttv.js')))
        .pipe(buffer())
        .pipe(gulp.dest('build'))
        .pipe(gulpif(IS_PROD, rename('betterttv.js')))
        .pipe(gulpif(IS_PROD, sourcemaps.init({loadMaps: true})))
        .pipe(gulpif(IS_PROD, uglify({output: {comments: saveLicense}})))
        .pipe(gulpif(IS_PROD, sourcemaps.write('./')))
        .pipe(gulpif(IS_PROD, gulp.dest('build')))
);

gulp.task(
    'server',
    () => server()
);

gulp.task(
    'watch',
    ['default', 'server'],
    () => gulp.watch('src/**/*', ['default'])
);

gulp.task(
    'default',
    ['scripts']
);

gulp.task(
    'dist',
    ['scripts'],
    () => gulp.src('build/**/*')
        .pipe(tar('betterttv.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('dist'))
);
