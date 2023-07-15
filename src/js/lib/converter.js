import mime from 'mime-types'

/**
 *	Generate a filename
 */
const getFilename = suffix => {

	const zerofill = (n,len = 2) => {
		return ('00' + n.toString()).substr(-len)
	}

	let name = thepaste.options.default_filename

	const now = new Date(),
		postname = document.querySelector('#post [name="post_title"]#title').value,
		username = document.querySelector('.display-name').textContent,
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
	if ( 'undefined' !== typeof username ) {
		map.push( { s: '<username>', r: username } );
	} else {
		map.push( { s: '<username>', r: '' } );
	}
	map.forEach(function(el){
		name = name.replace( el.s, el.r )
	})
	if ( 'string' === typeof suffix) {
		name += '.' + suffix;
	}
	console.log(name,suffix)
	return name;
}

const safeFilename = ( file, filename = '' ) => {
	if ( ! filename ) {
		filename = getFilename( mime.extension(file.type) )
	}
	return filename
}

const Converter = {

	dataUrlToMime: dataurl =>{
		return dataurl.match('data:([^,]+),')[1]
	},
	dataUrlToType: dataurl =>{
		return dataurl.match('data:([^\/]+),')[1]
	},
	blobUrlToMime: async blobUrl =>{
		const blob = await Converter.blobUrlToBlob(blobUrl)
		return blob.type
	},
	blobUrlToType: async blobUrl => {
		const blob = await Converter.blobUrlToBlob(blobUrl)
		return blob.type.substr(0,blob.type.indexOf('/'))
	},

	urlToMime: async url => {
		const schema = url.substr( 0, url.indexOf(':') )
		let mime
		if ( 'data' === schema ) {
			mime = Converter.dataUrlToMime( url )
		} else if ( ['blob','http','https'].includes( schema ) ) {
			mime = await Converter.blobUrlToMime( url )
		}
		return mime
	},
	urlToType: async url => {
		const mime = await Converter.urlToMime(url)
		return mime.substr( 0, mime.indexOf('/'))
	},

	elementToFile: async el => {
		let file
		const schema = el.src.substr(0,el.src.indexOf(':'))

		if ( 'data' === schema ) {
			file = await Converter.dataUrlToFile( el.src, el.alt )
		} else if ( ['blob','http','https'].includes( schema ) ) {
			file = await Converter.blobUrlToFile( el.src, el.alt )
		}
		return file
	},

	blobUrlToDataUrl: async blobUrl => {
		const blob = await fetch(blobUrl).then( r => r.blob() );
		const dataurl = await Converter.fileToDataUrl(blob)
		return dataurl
	},

	fileToBlobUrl: file => URL.createObjectURL(file),

	fileToDataUrl: file => new Promise( (resolve,reject) => {
		const fr = new FileReader()
		fr.addEventListener('load', () => resolve( fr.result )  )
		fr.readAsDataURL( file )
	}),

	dataUrlToFile: ( dataurl, filename = '' ) => {
		let arr = dataurl.split(','),
			type = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);

		while(n--){
			u8arr[n] = bstr.charCodeAt(n);
		}
		const blob = new Blob( [u8arr], { type: type } )
		return Converter.blobToFile( blob, filename )
	},

	blobUrlToBlob: async ( blobUrl, filename = '' ) => {
		const blob = await fetch(blobUrl).then( r => r.blob() );
		return blob
	},

	blobUrlToFile: async ( blobUrl, filename = '' ) => {
		const blob = await Converter.blobUrlToBlob(blobUrl)
		return Converter.blobToFile( blob, filename )
	},

	blobToFile: ( blob, filename = '' ) => {
		return new File([blob], safeFilename( blob, filename ), { type: blob.type } );
	}
}

module.exports = Converter
