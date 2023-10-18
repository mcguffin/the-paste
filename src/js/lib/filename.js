import mime from 'mime-types'

const fixMime = {
	'application/x-zip-compressed': 'application/zip',
}

/**
 *	Generate a filename
 */
const generateFilename = suffix => {

	const zerofill = (n,len = 2) => {
		return ('00' + n.toString()).substr(-len)
	}

	let name = thepaste.options.default_filename

	const now = new Date(),
		postname = document.querySelector('#post [name="post_title"]#title')?.value
			|| document.querySelector('.wp-block-post-title')?.textContent
			|| document.querySelector('h1')?.textContent,
		replace_values = thepaste.options.filename_values,
		// username = document.querySelector('.display-name')?.textContent,
		map = [
			{ s: '%Y', r: now.getFullYear() },
			{ s: '%y', r: now.getFullYear() % 100 },
			{ s: '%m', r: zerofill(now.getMonth() + 1) },
			{ s: '%d', r: zerofill(now.getDate()) },
			{ s: '%e', r: now.getDate() },
			{ s: '%H', r: zerofill(now.getHours()) },
			{ s: '%I', r: zerofill(now.getHours() % 12 ) },
			{ s: '%M', r: zerofill(now.getMinutes()) },
			{ s: '%S', r: zerofill(now.getSeconds()) },
			{ s: '%s', r: Math.floor( now.getTime() / 1000 ) }
		];
	if ( 'undefined' !== typeof postname ) {
		map.push( { s: '<postname>', r: postname } );
	} else {
		map.push( { s: '<postname>', r: '' } );
	}
	Object.keys( replace_values ).forEach( k => {
		if ( !! replace_values[k] ) {
			map.push( { s: `<${k}>`, r: replace_values[k] } );
		} else {
			map.push( { s: `<${k}>`, r: '' } );
		}
	})
	map.forEach(function(el){
		name = name.replace( el.s, el.r )
	})
	if ( 'string' === typeof suffix) {
		if ( 'jpeg' === suffix ) { // dammit mime-types lib!
			suffix = 'jpg'
		}
		name += '.' + suffix;
	}
	return name;
}

const safeFilename = ( file, filename = '' ) => {
	let type = file.type

	if ( !! fixMime[type] ) { // windows
		type = fixMime[type]
	}
	const suffix = mime.extension(type)
	filename = filename.replace(/[^\p{L}\p{M}\p{S}\p{N}\p{P}\p{Zs}]/ug,'-').trim()
	if ( ! filename ) {
		filename = generateFilename( suffix )
	}
	if ( suffix !== filename.split('.').pop() ) {
		filename += `.${suffix}`
	}
	return filename
}

module.exports = { generateFilename, safeFilename }
