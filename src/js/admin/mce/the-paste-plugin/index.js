import $ from 'jquery'
import mime from 'mime-types'
import Converter from 'converter'
import Notices from 'notices'
import PasteOperation from 'paste-operation'
import Uploader from 'uploader'

tinymce.PluginManager.add( 'the_paste', editor => {

	let pasteBtn,
		toolbar

	// default on
	thepaste.options.editor.auto_upload = localStorage.getItem( 'thepaste.auto_upload' ) !== 'false';
	// enable / disable autoupload
	editor.addCommand( 'cmd_thepaste', function() {
		thepaste.options.editor.auto_upload = ! thepaste.options.editor.auto_upload;
		localStorage.setItem( 'thepaste.auto_upload', thepaste.options.editor.auto_upload.toString() );
		pasteBtn.active( thepaste.options.editor.auto_upload );
	});

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

	// upload button in media toolbar flyout
	editor.addButton('wp_img_thepaste_upload', {
		icon: 'dashicon dashicons dashicons-upload thepaste-upload',
		tooltip: thepaste.l10n.upload_image,
		onclick: function() {
			// wrap img, upload
			Uploader.inlineUpload( editor.selection.getNode() )
		}
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
			editor.dom.doc.body.addEventListener('beforeinput', e => { console.log(e) })
			editor.dom.doc.body.addEventListener('input', e => { console.log(e) })
			editor.dom.doc.body.addEventListener('paste', e => { console.log(e) })
			editor.dom.doc.body.addEventListener('FilesPasted', e => {
				editor.dom.doc.body.querySelectorAll('[src^="blob:"],[src^="data:"]').forEach( async el => {

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
			})
		})
		.on( 'Paste', e => {
			pasteOperation = new PasteOperation( e )
			pasteOperation.forceBlob = true
		})
		.on( 'PastePreProcess', e => {
			let content
			if ( ! pasteOperation.isObserving && (content = pasteOperation.pastedContent ) ) {
				e.content = content
			}
		})
		.on( 'PastePostProcess', e => {
			if ( ! pasteOperation.isObserving ) {
				setTimeout( () => editor.dom.doc.body.dispatchEvent(new Event('FilesPasted')))
			}
		});
} );

// } )(jQuery);
