const exts  = Object.keys( thepaste.options.mime_types )
const types = Object.values( thepaste.options.mime_types )

// windows
exts.push('zip')
types.push('application/x-zip-compressed')

module.exports = {
	extension: type => {
		const idx = types.indexOf( type )
		return -1 !== idx ? exts[idx] : false
	},
	type: ext => {
		const idx = exts.indexOf( ext )
		return -1 !== idx ? types[idx] : false
	}
}
