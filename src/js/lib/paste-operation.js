import Converter from 'converter'
import mime from 'mime-types'
import UA from 'ua'

class PasteOperation {

	#observer
	#observerState = false

	#addedNodes    = []
	#strings       = []
	#fileItemTypes = []
	#eventLog      = []


	get isObserving() {
		return this.#observerState
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
		this.forceBlob      = false
		this.didInputEvent  = false

		this.files = Array.from(event.clipboardData.files)

		event.target.addEventListener( 'input', e => {
			if ( e.eventType === 'insertFromPaste' ) {
				this.didInput = true
				// wait for mutation
			}
		}, { once: true } )

		//  items
		Array.from(event.clipboardData.items).forEach( item => {

			if ( item.kind === 'file' ) {
				this.#fileItemTypes.push( item.type )
			} else {
				item.getAsString( s => this.#strings.push( s ) )
			}
		} )
		// ALWAYS observe DOM
		if ( UA.browser === 'firefox' && this.files.length < 2 ) {
			this.files = this.fileItemTypes = []
			this.#observeDom( event.target.body || event.target.closest('body') )
			setTimeout( () => this.#unobserveDom(), 5000 )
		}
	}

	#observeDom( observed ) {

		let t0 = false
		// always 2 mutations after paste
		this.#observer = new MutationObserver( ( entries, obs ) => {
			if ( t0 === false ) {
				t0 = new Date().getTime()
			}
			entries.forEach( entry => {
				this.#addedNodes = this.#addedNodes.concat( Array.from( entry.addedNodes ) )
				this.#addedNodes = this.#addedNodes.filter( node => observed.contains(node) )
			})
			const images = this.#addedNodes.filter( el => 'img' === el.nodeName.toLowerCase() )
			if ( 1 === images.length && this.#strings.length === 1 ) {
				images[0].alt = this.#strings[0].trim()
			}
			images.forEach( img => {
				if ( this.forceBlob && 0 === img.src.indexOf('data:') ) { // force blob
					console.log(Converter.dataUrlToMime(img.src))
					img.setAttribute('data-mime',Converter.dataUrlToMime(img.src))
					img.src = Converter.dataUrlToBlobUrl( img.src )
				}
			} )
			if ( this.didInputEvent ) {
				// last mutation after input event fired
				this.#unobserveDom()
			}
			if ( images.length ) {
				this.#addedNodes
					.filter( el => 'img' !== el.nodeName.toLowerCase() )
					.map( el => el.remove() )
				observed.dispatchEvent(new Event('FilesPasted'))
			}
		} )
		this.#observerState = true
		this.#observer.observe( observed, { childList: true, subtree: true } )
	}
	#unobserveDom() {
		this.#observer.disconnect()
		this.#observerState = false
	}
}

module.exports = PasteOperation
