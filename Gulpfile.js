var gulp = require('gulp');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');
var pkg = require('./package.json');

var paths = {
	images: [
		'bower_components/select2/*.png',
		'bower_components/select2/*.gif'
	],
	stylesheets: {
		plugins: [
			'bower_components/select2/select2.css'
		]
	},
	scripts: {
		plugins: [
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/select2/select2.min.js',
			'bower_components/jquery-maskedinput/dist/jquery.maskedinput.min.js',
			'bower_components/jquery-maskmoney/dist/jquery.maskMoney.min.js'
		],
		app: 'src/jquery.custom-form.js'
	}
};

gulp.task('css-dist', function() {
	gulp.src(paths.images)
		.pipe(gulp.dest('build'));

	gulp.src(paths.stylesheets.plugins)
		.pipe(concat('plugins.min.css'))
		.pipe(minifyCSS())
		.pipe(gulp.dest('build'));
});

gulp.task('js-hint', function() {
	gulp.src(paths.scripts.app)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('js-dist', function() {
	gulp.src(paths.scripts.plugins)
		.pipe(concat('plugins.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build'));

	gulp.src(paths.scripts.app)
		.pipe(rename('jquery.' + pkg.name + '.min.js'))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('watch', function() {
	gulp.watch(paths.stylesheets.plugins, ['css-dist']);
	gulp.watch(paths.scripts.app, ['js-hint', 'js-dist']);
});

gulp.task('default', ['css-dist', 'js-hint', 'js-dist', 'watch'])