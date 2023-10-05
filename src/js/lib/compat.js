// Compatibility with [Real Media Library](https://wordpress.org/plugins/real-media-library-lite/)
// @see https://github.com/mcguffin/the-paste/issues/47

class Supports {
	get svg() {
		return _wpPluploadSettings.defaults.filters.mime_types[0].extensions.split(',').includes('svg')
	}
	get webp() {
		return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0
	}
}

const rml = {
	file: file => {
		if ( ! file.getSource ) {
			// return native file object
			// mimic mOxie.Blob.getSource()
			file.getSource = () => {
				return file
			}
		}
		return file
	}
}

const supports = new Supports()

module.exports = { rml, supports }
