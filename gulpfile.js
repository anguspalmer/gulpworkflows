var gulp = require('gulp'),
	gutil = require('gulp-util'),
	coffee = require('gulp-coffee'),
	browserify = require('gulp-browserify'),
	compass = require('gulp-compass'),
	connect = require('gulp-connect'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	minifyHTML = require('gulp-minify-html'),
	cleanDest = require('gulp-clean-dest'),
	imagemin = require('gulp-imagemin'),
	eslint = require('gulp-eslint'),
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
		.pipe(gulpif(env==='production',uglify()))
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
	gulp.watch(jsSources,['lint']);
	gulp.watch(jsSources,['js']);
	gulp.watch('components/sass/*.scss',['sass']);
	gulp.watch('builds/development/js/*.json',['json']);
	gulp.watch('builds/development/*.html',['html']);
	gulp.watch('builds/development/images/**/*.*',['images']);
});

gulp.task('connect', function(){
	connect.server({
		root : outputDir,
		livereload : true
	});
});

gulp.task('html', function(){
	gulp.src('builds/development/*.html')
		.pipe(gulpif(env === 'production', minifyHTML()))
		.pipe(gulpif(env === 'production', gulp.dest(outputDir)))
		.pipe(connect.reload());
});

gulp.task('json', function(){
	gulp.src('builds/development/js/*.json')
		.pipe(gulpif(env === 'production', minifyHTML()))
		.pipe(gulpif(env === 'production', gulp.dest(outputDir + 'js')))
		.pipe(connect.reload());
});

gulp.task('images', function(){
	gulp.src('builds/development/images/**/*.*')
		.pipe(gulpif(env === 'production', imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }]
		})))
		.pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
		.pipe(connect.reload());
});

gulp.task('lint', function(){
	gulp.src(jsSources)
		.pipe(eslint({
			'extends': 'eslint:all',
			'rules':{
        		'semi': [1, 'always'],
        		'no-unused-vars': [1, 'local']
    		}
		}))
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});


gulp.task('default',['coffee','lint','js','sass','images','json','html','connect','watch']);