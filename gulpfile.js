var gulp = require('gulp'),
	gutil = require('gulp-util'),
	coffee = require('gulp-coffee'),
	browserify = require('gulp-browserify'),
	compass = require('gulp-compass'),
	connect = require('gulp-connect'),
	cleanDest = require('gulp-clean-dest'),
	concat = require('gulp-concat');

var env,
	coffeeSources,
	jsSources,
	jsonSources,
	sassSources,
	htmlSources,
	sassStyle,
	outputDir;

env = process.env.NODE_ENV || 'development';

if (env === 'development') {
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
}else{
	outputDir = 'builds/production/';
	sassStyle = 'compressed';
}

var coffeeSources = ['components/coffee/tagline.coffee'];
var jsSources = [
	'components/scripts/rclick.js',
	'components/scripts/pixgrid.js',
	'components/scripts/tagline.js',
	'components/scripts/template.js'
];

var sassSources = ['components/sass/style.scss'];

var htmlSources = [outputDir + '*.html'];

var jsonSources = [outputDir + 'js/*.json'];



gulp.task('coffee', function() {
	gulp.src(coffeeSources)
		.pipe(coffee({ bare: true})
			.on('error', gutil.log))
		.pipe(gulp.dest('components/scripts'))
});

gulp.task('js', function(){
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(browserify())
		.pipe(gulp.dest(outputDir + 'js'))
		.pipe(connect.reload())
});

gulp.task('sass', function(){
	gulp.src(sassSources)
		.pipe(compass({
			sass: 'components/sass', 
			image: outputDir + 'images',
			style: sassStyle,
			comments: true,
			sourcemap: true
		}))
		.on('error',gutil.log)
		.pipe(gulp.dest(outputDir + 'css'))
		.pipe(cleanDest('css'))
		.pipe(connect.reload())
});

gulp.task('watch', function(){
	gulp.watch(coffeeSources,['coffee']);
	gulp.watch(jsSources,['js']);
	gulp.watch('components/sass/*.scss',['sass']);
	gulp.watch(jsonSources,['json']);
	gulp.watch(htmlSources,['html']);
});

gulp.task('connect', function(){
	connect.server({
		root : outputDir,
		livereload : true
	});
});

gulp.task('html', function(){
	gulp.src(htmlSources)
		.pipe(connect.reload())
});

gulp.task('json', function(){
	gulp.src(jsonSources)
		.pipe(connect.reload())
});

gulp.task('default',['coffee','js','sass','json','connect','watch']);