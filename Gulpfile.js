var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var pkg = require('./package.json');

var paths = {
	scripts: [
		'./src/jquery.custom-form.js'
	]
};

gulp.task('js-hint', function() {
	gulp.src(paths.scripts)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('js-dist', function() {
	gulp.src(paths.scripts)
		.pipe(concat('./build'))
		.pipe(rename(pkg.name + '.min.js'))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(gulp.dest('./build'));
});

gulp.task('default', function() {
	gulp.run('js-hint', 'js-dist');

	gulp.watch(paths.scripts, ['js-hint', 'js-dist']);
});