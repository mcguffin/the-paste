import $ from 'jquery'
import mime from 'mime-types'
import Converter from 'converter'
import Notices from 'notices'
import UA from 'ua'
import Uploader from 'uploader'

class PasteOperation {

	get isAsync() {
		return this.gdocsItems.length > 0
	}

	get hasPastedFiles() {
		return this.files.length > 0
	}

	get pastedContent() {
		return this.isAsync
			? '<p id="the-pasted-async"></p>' // this.gdocsItems.map( (item,idx) => `<img id="the-pasted-async-${idx}" />`).join('')
			: this.files.map( (file,idx) => {
					const src = URL.createObjectURL(file)

					return `<img id="the-pasted-${file.type}-${idx}" src="${src}" alt="${file.name}" />`
				} )
				.join('')
	}

	constructor(event) {
		const body = event.target.closest('body')
		this.gdocsItems = Converter.getGdocsClipboardItems( event.clipboardData.items )
		this.files = Array.from( event.clipboardData.files )


		// no files
		if ( ! this.isAsync && ! this.files.length ) {
			return
		}
		if ( this.isAsync ) {
			// google docs clipboard items present
			(async () => {
				let i
				const html = await Converter.clipboardItemsToHtml( event.clipboardData.items )
				const div = document.createElement('div')
				const placeholder = body.querySelector('#the-pasted-async')
				const images = []

				div.innerHTML = html
				images.push( ...Array.from(div.querySelectorAll('img')) )
				body.insertBefore( div, placeholder )
				placeholder.remove()

				if ( images.length ) {
					for ( i=0; i < images.length; i++ ) {
						images[i].src = await Converter.urlToBlobUrl(images[i].src)
					}
					body.dispatchEvent(new Event('FilesPasted'))
				}
			})()
		} else if ( UA.browser === 'firefox' ) {
			// firefox can only paste one file at a time
			// luckily it is available in the DOM during the input event
			body.addEventListener( 'input', e => {
				// this.files.push( ... await Converter.gdocsClipboardItemsToFiles( event.clipboardData.items ) )
				if ( this.files.length === 1 ) {
					body.querySelector('[src^="data:"]').alt = this.files[0].name
				}
				body.dispatchEvent(new Event('FilesPasted'))
			}, { once: true } )
		}
	}
}


tinymce.PluginManager.add( 'the_paste', editor => {

	let pasteBtn,
		toolbar

	if ( ! thepaste.options.editor.datauri ) {

		// always auto uploaded
		thepaste.options.editor.auto_upload = true

	} else {

		// user choice
		thepaste.options.editor.auto_upload = localStorage.getItem( 'thepaste.auto_upload' ) !== 'false';

		// enable / disable autoupload button
		editor.addButton( 'thepaste', {
			icon: 'thepaste',
			tooltip: thepaste.l10n.upload_pasted_images,
			cmd : 'cmd_thepaste',
			onPostRender: function() {
				pasteBtn = this;
			},
			active: thepaste.options.editor.auto_upload
		});

	}

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

	// enable / disable autoupload
	editor.addCommand( 'cmd_thepaste', function() {
		thepaste.options.editor.auto_upload = ! thepaste.options.editor.auto_upload;
		localStorage.setItem( 'thepaste.auto_upload', thepaste.options.editor.auto_upload.toString() );
		pasteBtn.active( thepaste.options.editor.auto_upload );
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


	// true if data source or blob image
	function canUpload( img ) {
		var sub = img.src.substring(0,5);
		return sub === 'blob:' || sub === 'data:';
	}

	let pasteOperation
	editor
		.on( 'init', () => {
			const processImage = async loadedImg => {
				if ( loadedImg.naturalWidth * loadedImg.naturalHeight > thepaste.options.editor.force_upload_size ) {
					Uploader.inlineUpload(loadedImg).catch( err => Notices.error( err.message, true ) || loadedImg.remove() )
				} else if ( loadedImg.src.substr(0,4) === 'blob' ) {
					// make data src
					loadedImg.src = await Converter.blobUrlToDataUrl(loadedImg.src)
				}
			}
			editor.dom.doc.body.addEventListener('FilesPasted', e => {
				editor.dom.doc.body.querySelectorAll('[src^="blob:"]:not(.--paste-process),[src^="data:"]:not(.--paste-process)').forEach( async el => {
					el.classList.add('--paste-process')

					if ( ! thepaste.options.editor.auto_upload
						&& 'image' === await Converter.urlToType(el.src)
			 		) {
						if ( el.complete ) {
							processImage( el )
						} else {
							el.onload = async () => processImage( el )
						}
					} else {
						Uploader.inlineUpload( el ).catch( err => Notices.error( err.message, true ) || el.remove() )
					}
				})
				pasteOperation = null
			})
		})
		.on( 'Paste', e => {
			pasteOperation = new PasteOperation( e )
		})
		.on( 'PastePreProcess', e => { // not fired in FF
			let content
			// get html from pasteOperation
			if ( content = pasteOperation.pastedContent ) {
				e.content = content
			}
		})
		.on( 'PastePostProcess', e => { // not fired in FF
			// DOM modification can be processed
			setTimeout( () => editor.dom.doc.body.dispatchEvent(new Event('FilesPasted')))
		});
} );

// } )(jQuery);
