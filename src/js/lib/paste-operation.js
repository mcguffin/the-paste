import mime from 'mime-types'
import getBrowser from 'ua'

const allowedExtensions   = _wpPluploadSettings.defaults.filters.mime_types[0].extensions.split(',')
const maxFileSize         = Math.min( 1024*1024*100, parseInt(_wpPluploadSettings.defaults.filters.max_file_size) ) // 100MB or uplaod max filesize

const sizeAllowed = file => {
	return !!file && file.size <= maxFileSize
}
const extensionAllowed = file => {
	return !!file && allowedExtensions.includes( mime.extension( file.type ) )
}


class PasteOperation {

	#observer
	#observerState = false
	#observed

	#addedNodes    = []
	#files         = []
	#strings       = []
	#fileItemTypes = []

	get isFinished() {
		return ! this.#observerState
	}

	get files() {
		return this
			.#files
			.filter( file => sizeAllowed( file ) && extensionAllowed( file ) )
	}

	get hasPastedFiles() {
		return this.#fileItemTypes.length > 0 || this.files.length > 0
	}

	get pastedContent() {
		return this.files.map( (file,idx) => {
			const src = URL.createObjectURL(file)
			return `<img id="the-pasted-${file.type}-${idx}" src="${src}" alt="${file.name}" />`
		} )
		.join('')
	}

	constructor(event) {
		// files
		this.#files = Array.from(event.clipboardData.files)

		//  items
		Array.from(event.clipboardData.items).forEach( item => {

			if ( item.kind === 'file' ) {
				this.#fileItemTypes.push( item.type )
			} else {
				item.getAsString( s => this.#strings.push( s ) )
			}
		} )
		if ( this.hasPastedFiles ) {
			// event.clipboardData.clearData()
		}

		// firefox: observe DOM
		if ( ( ! this.files.length || 'Firefox' === getBrowser() ) && this.hasPastedFiles ) {
			this.#files = this.#fileItemTypes = []
			this.#observeDom( event.target.body || event.target.closest('body') )
		}
	}

	#observeDom( observed ) {

		let t0 = false
		this.#observer = new MutationObserver( ( entries, obs ) => {
			if ( t0 === false ) {
				t0 = new Date().getTime()
			}

			entries.forEach( entry => {
				this.#addedNodes = this.#addedNodes.concat( Array.from( entry.addedNodes ) )
				this.#addedNodes = this.#addedNodes.filter( node => observed.contains(node) )
			})
			const img = this.#addedNodes.find( el => 'img' === el.nodeName.toLowerCase() )

			if ( !! img ) {
				if ( this.#strings.length === 1 ) {
					img.alt = this.#strings[0]
				}
				obs.disconnect()
				this.#observerState = false
				observed.dispatchEvent(new Event('FilesPasted'))
			}
		} )
		this.#observerState = true
		this.#observer.observe( observed, { childList: true, subtree: true } )
	}
}

module.exports = PasteOperation
