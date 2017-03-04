const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const header = require('gulp-header');
const saveLicense = require('uglify-save-license');
const server = require('./dev/server');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const git = require('git-rev-sync');

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
    'prepare',
    ['cleanup', 'lint'],
    () => gulp.src(['src/**/*'])
        .pipe(gulp.dest('build/'))
);

gulp.task(
    'lint',
    () => gulp.src(['src/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
);

gulp.task(
    'scripts',
    ['prepare'],
    () => browserify('build/index.js')
        .transform('require-globify')
        .transform('babelify', {presets: ['es2015']})
        .transform('envify')
        .bundle()
        .pipe(source('betterttv.js'))
        .pipe(buffer())
        .pipe(header(LICENSE + '\n'))
        .pipe(gulpif(IS_PROD, uglify({preserveComments: saveLicense})))
        .pipe(gulp.dest('build'))
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
