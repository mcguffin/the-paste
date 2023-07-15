import mime from 'mime-types'

module.exports = {
	dataTransferToFiles: dataTransferList => {
		const extensions = _wpPluploadSettings.defaults.filters.mime_types[0].extensions.split(',')

		return Array.from(dataTransferList)
			.filter( item => {
				console.log(item,item.kind  === 'file',item.type,mime.extension(item.type))
				return item.kind  === 'file' && extensions.includes( mime.extension(item.type) )
			})
			.map( item => {
				return item.getAsFile()
			} )
	},
	filesToString: files => {

	}
}
