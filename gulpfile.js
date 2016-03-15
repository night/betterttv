var fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    browserify = require('gulp-browserify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    concat = require('gulp-concat'),
    react = require('gulp-react'),
    eslint = require('gulp-eslint');

gulp.task('templates', function() {
    return gulp.src(['src/templates/*.jade'])
               .pipe(jade({client: true, globals: ['$', 'window', 'bttv', 'Twitch']}))
               .pipe(footer(';module.exports=template;'))
               .pipe(gulp.dest('build/templates/'));
});

gulp.task('prepare', function() {
    return gulp.src(['src/**/*'])
               .pipe(gulp.dest('build/'));
});

gulp.task('settings', function() {
    return gulp.src(['src/settings/settings.jsx'])
               .pipe(react())
               .pipe(gulp.dest('build/settings/'));
});

gulp.task('lint', function() {
    var options = {
        configFile: '.eslintrc'
    };

    return gulp.src(['src/**/*.js'])
        .pipe(eslint(options))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

var jadeDefinition = fs.readFileSync('node_modules/jade/runtime.js').toString();
var license = fs.readFileSync('license.txt').toString();

gulp.task('scripts', ['prepare', 'settings', 'templates', 'lint'], function() {
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
