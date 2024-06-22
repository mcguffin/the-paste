const autoprefixer  = require( 'gulp-autoprefixer' );
const browserify    = require( 'browserify' );
const babelify      = require( 'babelify' );
const buffer        = require( 'vinyl-buffer' );
const glob          = require( 'glob' );
const gulp          = require( 'gulp' );
const sass          = require( 'gulp-sass' )( require('sass') );
const source        = require( 'vinyl-source-stream' );
const sourcemaps    = require( 'gulp-sourcemaps' );
const uglify        = require( 'gulp-uglify-es' ).default;

const package = require( './package.json' );

let scssOverridePath

if ( process.argv.length > 3 && parseInt( process.argv[3] ) ) {
	/// 2DO: fucken fix this!
	scssOverridePath = '../../uploads/sites/' + process.argv[3] - '/scss/';
} else {
	scssOverridePath = 'src/scss-override/';
}

const config = {
	sass : {
		precision: 8,
		stopOnError: false,
		functions: {
		},
		includePaths:[
			'./src/scss/',
		],
		watchPaths: './src/scss/**/*.scss',
		// importers:[]
	},
	js: {
		exclude:[
			'./src/js/lib/'
		]
	},
	destPath: e => {
		let ext = e.extname, next
		if ( '.map' === ext ) {
			ext = e.basename.replace( ext, '' ).match(/\.\w+$/)[0]
		}
		return ext.replace( /^\./, './' );
	}
}

function js_task(debug) {
	return cb => {
		let tasks = glob.sync("./src/js/**/index.js")
			.filter( p => ! config.js.exclude.find( ex => p.indexOf(ex) !== -1 ) )
			.map( entry => {
				let target = entry.replace(/(\.\/src\/js\/|\/index)/g,'');
				const bundler = browserify({
						entries: [entry],
						debug: true, // keep always true
						paths:['./src/js/lib']
					})
					.transform( babelify.configure({}) )
					.transform( 'browserify-shim' );

				return bundler
					.bundle()
					.pipe(source(target))
					.pipe(buffer())
					.pipe(sourcemaps.init( { loadMaps: true } ) )
					.pipe( uglify() )
					.on('error', function (error) {
						console.error(error.message);
						// this.emit('end');
					})
					.pipe(sourcemaps.write( './' ) )
					.pipe( gulp.dest( config.destPath ) );
			} );
		return Promise.all(tasks)
	}
}
function scss_task(debug) {
	const conf = config.sass
	conf.outputStyle = debug ? 'expanded' : 'compressed'

	return cb => {
		return gulp.src( config.sass.watchPaths )
			.pipe( sourcemaps.init( ) )
			.pipe( sass( conf ) )
			.pipe(autoprefixer({}))
			.pipe( sourcemaps.write( '.' ) )
			.pipe( gulp.dest( config.destPath ) );
		// let g = gulp.src( config.sass.watchPaths ); // fuck gulp 4 sourcemaps!
		// if ( debug ) { // lets keep ye olde traditions
		// 	g = g.pipe( sourcemaps.init( ) )
		// }
		// g = g.pipe(
		// 	sass( conf )
		// )
		// ;
		// if ( debug ) {
		// 	g = g.pipe( sourcemaps.write( '.' ) )
		// }
		//
		// return g.pipe( gulp.dest( config.destPath ) );
	}
}


gulp.task('build:js', js_task( false ) );
gulp.task('build:scss', scss_task( false ) );

gulp.task('dev:js', js_task( true ) );
gulp.task('dev:scss', scss_task( true ) );


gulp.task('watch:scss',cb => {
	cb()
})


gulp.task('watch', cb => {
	gulp.watch( config.sass.watchPaths, gulp.parallel('dev:scss','watch:scss'));
	gulp.watch('./src/js/**/*.js',gulp.parallel('dev:js'));
});

gulp.task('dev',gulp.series('dev:scss','dev:js','watch'));

gulp.task('build', gulp.series('build:js','build:scss'));

gulp.task('default',cb => {
	console.log('run either `gulp build` or `gulp dev`');
	cb();
});


if ( process.argv.length > 3 && parseInt( process.argv[3] ) ) {
	gulp.task( process.argv[3], gulp.series('dev'));
}


module.exports = {
	build:gulp.series('build')
}
