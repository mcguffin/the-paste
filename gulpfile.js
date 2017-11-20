var pro;
var autoprefixer = require('gulp-autoprefixer');
var gulp = require('gulp');
var gulputil = require('gulp-util');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

try {
	pro = require('./pro/gulpfile.js');
} catch(err){
	pro = false;
}


function do_scss( src ) {
	var dir = src.substring( 0, src.lastIndexOf('/') );
	return gulp.src( './src/scss/' + src + '.scss' )
		.pipe( sourcemaps.init() )
		.pipe( sass( { outputStyle: 'nested' } ).on('error', sass.logError) )
		.pipe( autoprefixer({
			browsers:['last 2 versions']
		}) )
		.pipe( gulp.dest( './css/' + dir ) )
        .pipe( sass( { outputStyle: 'compressed' } ).on('error', sass.logError) )
		.pipe( rename( { suffix: '.min' } ) )
        .pipe( sourcemaps.write() )
        .pipe( gulp.dest( './css/' + dir ) );

}

function do_js( src ) {
	var dir = src.substring( 0, src.lastIndexOf('/') );
	return gulp.src( './src/js/' + src + '.js' )
		.pipe( sourcemaps.init() )
		.pipe( gulp.dest( './js/' + dir ) )
		.pipe( uglify().on('error', gulputil.log ) )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( './js/' + dir ) );
}

function concat_js( src, dest ) {
	return gulp.src( src )
		.pipe( sourcemaps.init() )
		.pipe( concat( dest ) )
		.pipe( gulp.dest( './js/' ) )
		.pipe( uglify().on('error', gulputil.log ) )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( sourcemaps.write() )
		.pipe( gulp.dest( './js/' ) );

}


gulp.task('scss', function() {
	return [
		do_scss('admin/the-paste'),
		do_scss('admin/mce/the-paste-editor'),
		do_scss('admin/mce/the-paste-toolbar'),
	];
});


gulp.task( 'js', function(){
	return [
		concat_js( [
			'./src/vendor/layerssss/paste.js/paste.js',
			'./src/js/admin/the-paste-base.js',
			'./src/js/admin/the-paste.js',
			'./src/js/admin/media-view.js'
		], 'admin/the-paste.js'),
		do_js('admin/mce/the-paste-plugin.js')
	]
} );



if ( ! pro ) {
	gulp.task('build', ['scss','js'] );
} else {
	gulp.task('build', ['scss','js', 'pro' ] );
}


gulp.task('watch', function() {
	// place code for your default task here
	gulp.watch('./src/scss/**/*.scss',[ 'scss' ]);
	gulp.watch('./src/js/**/*.js',[ 'js', 'js-admin' ]);
});

gulp.task('default', ['build','watch']);
