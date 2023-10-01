// Compatibility with [Real Media Library](https://wordpress.org/plugins/real-media-library-lite/)
// @see https://github.com/mcguffin/the-paste/issues/47
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

module.exports = { rml }
