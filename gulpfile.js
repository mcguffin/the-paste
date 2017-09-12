var gulp = require('gulp');
var gulputil = require('gulp-util');
var concat = require('gulp-concat');  
var uglify = require('gulp-uglify');  
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');


var styles = {
		'./css/admin/' : [ './src/scss/admin/the-paste.scss' ],
		'./css/admin/mce' : [
			'./src/scss/admin/mce/the-paste-toolbar.scss',
			'./src/scss/admin/mce/the-paste-editor.scss'
		],
	};
var vendor_scripts = [
		'./src/vendor/layerssss/paste.js/paste.js',
	],
	scripts = [
		'./src/js/admin/jquery-webcam-recorder.js',
		'./src/js/admin/the-paste-base.js',
		'./src/js/admin/the-paste.js',
		'./src/js/admin/media-view.js'
	],
	mce_scripts = {
		'the-paste' : [
			'./src/vendor/layerssss/paste.js/paste.js',
			'./src/js/admin/mce/the-paste-plugin.js',
		]
	};


gulp.task('styles-admin',function(){
    var src = [];
    for ( var dest in styles ) {
		src.push(gulp.src( styles[dest] )
			.pipe(sourcemaps.init())
			.pipe( sass( { 
				outputStyle: 'compressed' 
			} ).on('error', sass.logError) )
			.pipe( sourcemaps.write() )
			.pipe( gulp.dest( dest ) )
		);
    }
});

gulp.task('scripts-admin', function() {

    var scr = [ gulp.src( vendor_scripts.concat( scripts ) )
			.pipe( concat('the-paste.js') )
			.pipe( gulp.dest( './js/admin/' ) )
			.pipe( sourcemaps.init() )
			.pipe( uglify().on('error', gulputil.log ) )
			.pipe( rename('the-paste.min.js') )
			.pipe( sourcemaps.write() )
			.pipe( gulp.dest( './js/admin/' ) ),
    ];
    for ( var s in mce_scripts ) {
    	scr.push( [
			gulp.src( mce_scripts[s] )
				.pipe( concat( s + '-plugin.js') )
				.pipe( gulp.dest( './js/admin/mce/' ) )
				.pipe( sourcemaps.init() )
				.pipe( uglify().on('error', gulputil.log ) )
				.pipe( rename( s + '-plugin.min.js') )
				.pipe( sourcemaps.write() )
				.pipe( gulp.dest( './js/admin/mce/' ) )
		] );
    }
    return scr;
});


gulp.task( 'watch', function() {
	gulp.watch('./src/scss/**/*.scss', ['styles-admin'] );
	gulp.watch('./src/js/**/*.js', ['scripts-admin'] );
	gulp.watch('./src/vendor/**/*.js', ['scripts-admin'] );
} );

var build = ['styles-admin','scripts-admin'];

gulp.task( 'build', ['styles-admin','scripts-admin'] );

gulp.task( 'default', ['build','watch'] );

