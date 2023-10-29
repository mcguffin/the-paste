import $ from 'jquery'
import Converter from 'converter'
import Notices from 'notices'
import Uploader from 'uploader'

class PasteOperation {

	static #instance = null
	static #isEnabled = true

	#files = []
	#isAsync = false

	static init( event, preferFiles = true ) {
		PasteOperation.#instance = new PasteOperation( event, preferFiles )
		return PasteOperation.get();
	}

	static get() {
		return PasteOperation.#instance
	}

	static destroy() {
		PasteOperation.#instance = null
	}

	static setEnabled(enabled) {
		PasteOperation.#isEnabled = enabled
	}

	get isAsync() {
		return this.#isAsync
	}

	get hasPastedFiles() {
		return this.files.length > 0
	}

	get pastedContent() {
		return this.isAsync
			? '<p id="the-pasted-async"></p>' // paste html
			: this.files.map( (file,idx) => {
					const src = URL.createObjectURL(file)
					return `<p><img id="the-pasted-${file.type}-${idx}" src="${src}" alt="${file.name}" /></p>`
				} )
				.join('')
	}

	get files() {
		return this.#files
	}

	constructor( event, preferFiles ) {
		this.clipboardData = event.clipboardData
		this.body = event.target.closest('body')

		if ( PasteOperation.#isEnabled ) {
			this.#files = Array.from( this.clipboardData.files??[] )

			if ( ! this.files.length || ! preferFiles ) {
				this.#isAsync = Array.from( this.clipboardData.items ).filter( item => item.kind === 'string' && item.type === 'text/html' ).length > 0
			}
		}

		// no files
		if ( ! this.isAsync && ! this.files.length ) {
			return
		}

		if ( this.isAsync ) {
			// google docs clipboard items present
			(async () => {
				let i, u
				const loc = new URL( document.location )
				const html = await Converter.clipboardItemsToHtml( event.clipboardData.items )
				const div = document.createElement('div')
				const placeholder = this.body.querySelector('#the-pasted-async')
				const images = []

				div.innerHTML = html
				images.push( ...Array.from(div.querySelectorAll('img')) )
				const nodes = Array.from(div.childNodes).filter( node => [ Node.ELEMENT_NODE , Node.TEXT_NODE ].includes(node.nodeType))

				for ( i=0;i<nodes.length;i++ ) {
					placeholder?.before( nodes[i] )
				}
				// .forEach( node => placeholder?.before( node ) )
				placeholder?.remove()

				if ( images.length ) {
					for ( i=0; i < images.length; i++ ) {
						u = new URL(images[i].src)
						if ( ! ['http:','https:'].includes(u.protocol) || loc.hostname !== u.hostname ) {
							images[i].src = await Converter.urlToBlobUrl(images[i].src)
						}
					}
					this.body.dispatchEvent(new Event('FilesPasted'))
				}
			})()
		} else if ( this.body.querySelector('[src^="data:"]:not(.--paste-process)') ) {
			this.body.dispatchEvent(new Event('FilesPasted'))
		}
	}

	dumpClipboardData() {
		Array.from(this.clipboardData.files).forEach( el => console.log(el) )
		Array.from(this.clipboardData.items).forEach( el => {
			console.log(el,el.kind,el.type)
			if ( 'string' === el.kind ) {
				el.getAsString(s=>console.log(s))
			} else {
				console.log(el.getAsFile())
			}
		} )
		return this
	}
}


tinymce.PluginManager.add( 'the_paste', editor => {

	let pasteOnOffBtn,
		toolbar,
		isPlaintextState = false

	// enable / disable autoupload button
	editor.addButton( 'thepaste_onoff', {
		icon: 'thepaste_onoff',
		tooltip: thepaste.l10n.paste_files,
		onPostRender: function() {
			pasteOnOffBtn = this;
		},
		onClick: function() {
			this.active( ! this.active() )
			fetch(`${thepaste.options.editor.enable_ajax_url}&enabled=${this.active()?1:0}`)
		},
		active: thepaste.options.editor.enabled
	});


	// init media toolbar flyout
	editor.once( 'preinit', function() {
		if ( editor.wp && editor.wp._createToolbar ) {

			toolbar = editor.wp._createToolbar( [
				'wp_img_alignleft',
				'wp_img_aligncenter',
				'wp_img_alignright',
				'wp_img_alignnone',
				'wp_img_thepaste_upload',
				'wp_img_edit',
				'wp_img_remove',
			] );
		}
	} );

	// upload button in media toolbar flyout
	editor.addButton('wp_img_thepaste_upload', {
		icon: 'dashicon dashicons dashicons-upload thepaste-upload',
		tooltip: thepaste.l10n.upload_image,
		onclick: function() {
			// wrap img, upload
			Uploader.inlineUpload( editor.selection.getNode() )
		}
	});

	// setup media toolbar flyout on node change
	editor.on( 'wptoolbar', function( event ) {
		var uploadBtn;
		if ( event.element.nodeName === 'IMG' && ! editor.wp.isPlaceholder( event.element ) ) {
			event.toolbar = toolbar;

			uploadBtn = toolbar.$el.find('.thepaste-upload').closest('.mce-btn');

			if ( canUpload( event.element ) ) {
				uploadBtn.show();
			} else {
				uploadBtn.hide();
			}
		}
	} );


	// true if data source or blob image
	function canUpload( img ) {
		const sub = img.src.substring(0,5);
		return sub === 'blob:' || sub === 'data:';
	}

	const crawlPastedImages = () => {
		return Array.from( editor.dom.doc.body.querySelectorAll('[src^="blob:"]:not(.--paste-process),[src^="data:"]:not(.--paste-process)') )
	}

	editor
		.on( 'PastePlainTextToggle', ( { state } ) => {
			PasteOperation.setEnabled( ! state )
			pasteOnOffBtn.disabled( state )
		})
		.on( 'init', () => {
			editor.dom.doc.body.addEventListener('FilesPasted', async e => {

				let i, el
				const images = crawlPastedImages()
				for (i=0; i<images.length;i++) {
					el = images[i]
					el.classList.add('--paste-process')
					Uploader.inlineUpload( el ).catch( err => Notices.error( err.message, true ) || el.remove() )
				}
			})
		})
		.on( 'Paste', e => {
			if ( document.body.matches('.modal-open') ) {
				return;
			}
			const preferFiles = !pasteOnOffBtn || pasteOnOffBtn.active()
			const pasteOperation = PasteOperation.init( e, preferFiles ) //.dumpClipboardData()
			// pasteOperation.dumpClipboardData()
			// nothing to paste
			if ( ! pasteOperation.isAsync && ! pasteOperation.files.length ) {
				PasteOperation.destroy()
				return;
			}
			const editorPreProcess = e => {
				/*
				FF: Not Fired if clipboard contains file from FS
				*/
				let content
				// get html from pasteOperation
				if ( content = pasteOperation.pastedContent ) {
					e.content = content
				}

				PasteOperation.destroy()
			}
			const editorPostProcess = e => {
				setTimeout( () => editor.dom.doc.body.dispatchEvent(new Event('FilesPasted')))
				editor.off( 'PastePreProcess', editorPreProcess )
				editor.off( 'PastePostProcess', editorPostProcess )
			}

			editor.once( 'input', async ie => {
				/*
				Fired in FF if clipboard contains file from FS
				*/
				const images = crawlPastedImages()
				let idx, img
				if ( ! images.length ) {
					return
				}
				for ( idx=0; idx < images.length; idx++ ) {
					img = images[idx]
					if ( !! pasteOperation.files[idx] ) {
						img.alt = pasteOperation.files[idx].name
						img.src = URL.createObjectURL(pasteOperation.files[idx])
						// img.src = await Converter.dataUrlToBlobUrl(img.src)
					}
				}

				setTimeout( () => editor.dom.doc.body.dispatchEvent(new Event('FilesPasted')))

				if ( images.length === pasteOperation.files.length ) {
					// images already processed
					editor.off( 'PastePreProcess', editorPreProcess )
					editor.off( 'PastePostProcess', editorPostProcess )
				}
			})
			.on( 'PastePreProcess', editorPreProcess )
			.on( 'PastePostProcess', editorPostProcess )
		});
} );
