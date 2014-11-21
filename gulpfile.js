var fs = require('fs'),
    gulp = require('gulp'),
    jade = require('gulp-jade'),
    browserify = require('gulp-browserify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat');

gulp.task('templates', function() {
    return gulp.src(['build/templates/*.jade'])
               .pipe(jade({client: true, globals: ['$', 'window', 'bttv', 'Twitch']}))
               .pipe(footer(';module.exports=template;'))
               .pipe(gulp.dest('build/templates/'));
});

gulp.task('prepare', function() {
    return gulp.src(['src/**/*'])
               .pipe(gulp.dest('build/'));
})

var jadeDefinition = fs.readFileSync('node_modules/jade/runtime.js').toString();
var license = fs.readFileSync('license.txt').toString();

gulp.task('scripts', ['prepare', 'templates'], function() {
    gulp.src(['build/main.js'])
        .pipe(browserify())
        .pipe(concat('betterttv.js'))
        .pipe(header('(function(bttv) {'))
        .pipe(header(jadeDefinition))
        .pipe(header(license+'\n'))
        .pipe(footer("}(window.BetterTTV = window.BetterTTV || {}));"))
        .pipe(gulp.dest(__dirname));
});

gulp.task('watch', ['default'], function() {
    gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['scripts']);