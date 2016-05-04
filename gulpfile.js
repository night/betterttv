var fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    browserify = require('gulp-browserify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    concat = require('gulp-concat'),
    del = require('del'),
    eslint = require('gulp-eslint');

gulp.task('cleanup', function() {
    return del('build/**/*');
});

gulp.task('templates', ['cleanup'], function() {
    return gulp.src(['src/templates/*.jade'])
               .pipe(jade({client: true, globals: ['$', 'window', 'bttv', 'Twitch']}))
               .pipe(footer(';module.exports=template;'))
               .pipe(gulp.dest('build/templates/'));
});

gulp.task('prepare', ['lint', 'templates'], function() {
    return gulp.src(['src/**/*'])
               .pipe(gulp.dest('build/'));
});

gulp.task('lint', function() {
    var options = {
        configFile: '.eslintrc'
    };

    return gulp.src(['src/**/*'])
        .pipe(eslint(options))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

var jadeDefinition = fs.readFileSync('node_modules/jade/runtime.js').toString();
var license = fs.readFileSync('license.txt').toString();

gulp.task('scripts', ['prepare'], function() {
    gulp.src(['build/main.js'])
        .pipe(browserify())
        .pipe(concat('betterttv.js'))
        .pipe(header('(function(bttv) {'))
        .pipe(header(jadeDefinition))
        .pipe(header(license + '\n'))
        .pipe(footer('}(window.BetterTTV = window.BetterTTV || {}));'))
        .pipe(gulp.dest(__dirname));
});

gulp.task('watch', ['default'], function() {
    gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['scripts']);
