var fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    wrap = require('gulp-wrap-commonjs'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat');

gulp.task('templates', function () {
    return gulp.src(['src/templates/*.jade'])
               .pipe(jade({client: true, globals: ['$', 'window', 'bttv', 'Twitch']}))
               .pipe(rename({suffix: '-template'})) // avoid filename clashes
               .pipe(footer(';module.exports=template;'))
               .pipe(gulp.dest('build/templates/'));
});

var commonJsRequireDefinition = fs.readFileSync('node_modules/commonjs-require/commonjs-require.js').toString();
var jadeDefinition = fs.readFileSync('node_modules/gulp-jade/node_modules/jade/runtime.js').toString();
var license = fs.readFileSync('license.txt').toString();

gulp.task('scripts', ['templates'], function () {
    // if we want .coffee, we can compile them to build/*.js
    //  and include them here
    gulp.src(['src/**/*.js', 'build/templates/*.js'])
        .pipe(wrap({pathModifier: commonjsPath}))
        .pipe(concat('betterttv.js'))
        .pipe(header('(function (bttv) { \n'))
        .pipe(header(jadeDefinition))
        .pipe(header(commonJsRequireDefinition))
        .pipe(header(license+'\n'))
        .pipe(footer("\n\
require('main'); \n\
}(window.BetterTTV = window.BetterTTV || {}));"))
        .pipe(gulp.dest(__dirname));
});

gulp.task('watch', ['default'], function () {
    gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['scripts']);

function commonjsPath(path) {
    // lowercase so that on windows, C:/ is c:/
    return path.replace(/.*\/src/, '').replace(/.*\/build/, '') // remove directory from path
               .replace(/(\-template)?\.js$/, '') // drop extension and remove -template suffix
               .replace(/^\//, ''); // drop leading / if it exists
}