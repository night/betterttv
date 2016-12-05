var fs = require('fs'),
    gulp = require('gulp'),
    babel = require('gulp-babel'),
    pug = require('gulp-pug'),
    browserify = require('browserify'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    del = require('del'),
    eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    saveLicense = require('uglify-save-license'),
    gulpif = require('gulp-if'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

gulp.task('cleanup', function() {
    return del('build/**/*');
});

gulp.task('templates', ['cleanup'], function() {
    return gulp.src(['src/templates/*.pug'])
               .pipe(pug({client: true, globals: ['$', 'window', 'bttv', 'Twitch']}))
               .pipe(babel({presets: ['es2015']}))
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

    return gulp.src(['src/js/**/*'])
        .pipe(eslint(options))
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

var license = fs.readFileSync('src/license.txt').toString();

gulp.task('scripts', ['prepare'], function() {
    return browserify('build/js/main.js')
        .bundle()
        .pipe(source('betterttv.js'))
        .pipe(buffer())
        .pipe(header('(function(bttv) {'))
        .pipe(header(license + '\n'))
        .pipe(footer('}(window.BetterTTV = window.BetterTTV || {}));'))
        .pipe(gulpif(process.env.NODE_ENV === 'production', uglify({ preserveComments: saveLicense })))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function() {
    gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['scripts']);
