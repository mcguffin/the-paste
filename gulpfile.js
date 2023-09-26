const fs			= require( 'fs' );
const gulp			= require( 'gulp' );
const glob			= require( 'glob' );
const autoprefixer	= require( 'gulp-autoprefixer' );
const browserify	= require( 'browserify' );
const babelify		= require( 'babelify' );
const buffer		= require( 'vinyl-buffer' );
const sass			= require( 'gulp-sass' )( require('sass') );
const source		= require( 'vinyl-source-stream' );
const sourcemaps	= require( 'gulp-sourcemaps' );
const es			= require( 'event-stream' );
const child_process	= require( 'child_process' );


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
			'base64Encode($string)': $string => {
				var buffer = new Buffer( $string.getValue() );
				return sass.types.String( buffer.toString('base64') );
			}
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


gulp.task('i18n:make-pot',cb => {
	//child_process.execSync(`wp i18n make-pot . languages/${package.name}.pot --domain=${package.name} --include=src/js/*.js,*.php --exclude=*.*`);
	child_process.execSync(`wp i18n make-pot . languages/${package.name}.pot --domain=${package.name} --exclude=tmp,node_modules,vendor,*.js`)
	cb();
})



function js_task(debug) {
	return cb => {
		let tasks = glob.sync("./src/js/**/index.js")
			.filter( p => ! config.js.exclude.find( ex => p.indexOf(ex) !== -1 ) )
			.map( entry => {
				let target = entry.replace(/(\.\/src\/js\/|\/index)/g,'');
				return browserify({
						entries: [entry],
						debug: debug,
						paths:['./src/js/lib']
					})
					.transform( babelify.configure({}) )
					.transform( 'browserify-shim' )
					.plugin('tinyify')
					.bundle()
					.pipe(source(target))
					.pipe( gulp.dest( config.destPath ) );
			} );

		return es.merge(tasks).on('end',cb)
	}
}
function scss_task(debug) {
	const conf = config.sass
	conf.outputStyle = debug ? 'expanded' : 'compressed'

	return cb => {
		let g = gulp.src( config.sass.watchPaths ); // fuck gulp 4 sourcemaps!
		if ( debug ) { // lets keep ye olde traditions
			g = g.pipe( sourcemaps.init( ) )
		}
		g = g.pipe(
			sass( conf )
		)
		.pipe(autoprefixer({}));
		if ( debug ) {
			g = g.pipe( sourcemaps.write( '.' ) )
		}

		return g.pipe( gulp.dest( config.destPath ) );
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
	// gulp.watch('./languages/*.po',gulp.parallel('i18n:make-json'));
});

gulp.task('dev',gulp.series('dev:scss','dev:js','watch'));

gulp.task('i18n', gulp.series( 'i18n:make-pot'));

gulp.task('build', gulp.series('build:js','build:scss' /*, 'i18n'*/));

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
