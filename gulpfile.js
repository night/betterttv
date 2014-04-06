var fs = require('fs');
var gulp = require('gulp');
var jade = require('gulp-jade');
var wrap = require('gulp-commonjs-wrap');
var header = require('gulp-header');
var footer = require('gulp-footer');
var rename = require('gulp-rename');
var concat = require('gulp-concat');

var commonJsRequireDefinition =
	fs.readFileSync('node_modules/commonjs-require-definition/require.js')
	.toString().replace("'use strict'", "");
var jadeDefinition =
	fs.readFileSync('node_modules/gulp-jade/node_modules/jade/runtime.js')
	.toString().replace("'use strict'", "");

gulp.task('templates', function () {
	return gulp.src(['src/templates/*.jade'])
		.pipe(jade({client: true}))
		.pipe(rename({suffix: '-template'})) // avoid filename clashes
		.pipe(footer(';module.exports=template;'))
		.pipe(gulp.dest('build/templates/'))
});

gulp.task('scripts', ['templates'], function () {
	gulp.src(['src/*.js', 'build/templates/*.js'])
		.pipe(wrap({pathModifier: commonjsPath}))
		.pipe(concat('betterttv.js'))
		.pipe(header('(function (bttv) { \n'))
		.pipe(header(jadeDefinition))
		.pipe(header(commonJsRequireDefinition))
		.pipe(footer("\n\
require('main'); \n\
}(window.BetterTTV = window.BetterTTV || {}));"))
		.pipe(gulp.dest(__dirname))
});

gulp.task('watch', ['default'], function () {
	gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['scripts']);

function commonjsPath(path) {
	// lowercase so that on windows, C:/ is c:/
	return path.toLowerCase().replace(__dirname, '').replace(/\\/g, '/')
		.replace('/src/', '').replace('/build/', '') // normalize path
		.replace('-template.', '.') // remove -template suffix
		.replace('.js', '') // drop extension
}