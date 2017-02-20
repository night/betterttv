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

const isProd = process.env.NODE_ENV === 'production';
const license = `/** @license
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
        .bundle()
        .pipe(source('betterttv.js'))
        .pipe(buffer())
        .pipe(header(license + '\n'))
        .pipe(gulpif(isProd, uglify({preserveComments: saveLicense})))
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
