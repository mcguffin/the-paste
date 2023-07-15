import $ from 'jquery';
import mime from 'mime-types'
import { uploadPastedFile, processPastedImage, uploadPastedDataImg, uploadPastedBlobImg, convertPastedBlobImg, dataUrlToFile } from 'the-paste'

tinymce.PluginManager.add( 'the_paste', editor => {
	if ( tinymce.settings.paste_data_images ) {
		// UI
	}
	//
	// var pasteBtn,
	// 	thepaste = wp.media.thepaste,
	// 	toolbar,
	// 	pasted_image_tmp_prefix = '__pasted_image_tmp_',
	// 	currentPasted = 0;
	//
	// // default on
	// thepaste.options.editor.auto_upload = localStorage.getItem( 'thepaste.auto_upload' ) !== 'false';
	// if ( thepaste.options.editor.can_upload ) {
	// 	// enable / disable autoupload
	// 	editor.addCommand( 'cmd_thepaste', function() {
	// 		thepaste.options.editor.auto_upload = ! thepaste.options.editor.auto_upload;
	// 		localStorage.setItem( 'thepaste.auto_upload', thepaste.options.editor.auto_upload.toString() );
	// 		pasteBtn.active( thepaste.options.editor.auto_upload );
	//
	// 	});
	//
	// 	// enable / disable autoupload button
	// 	editor.addButton('thepaste', {
	// 		icon: 'thepaste',
	// 		tooltip: thepaste.l10n.upload_pasted_images,
	// 		cmd : 'cmd_thepaste',
	// 		onPostRender: function() {
	// 			pasteBtn = this;
	// 		},
	// 		active:thepaste.options.editor.auto_upload
	// 	});
	//
	// 	// upload button in media toolbar flyout
	// 	editor.addButton('wp_img_thepaste_upload', {
	// 		icon: 'dashicon dashicons dashicons-upload thepaste-upload',
	// 		tooltip: thepaste.l10n.upload_image,
	// 		onclick: function() {
	// 			// wrap img, upload
	// 			var image;
	// 			image = editor.selection.getNode();
	//
	// 			thepaste.uploadImage( image, editor );
	// 		}
	// 	});
	//
	// 	// init media toolbar flyout
	// 	editor.once( 'preinit', function() {
	// 		if ( editor.wp && editor.wp._createToolbar ) {
	// 			toolbar = editor.wp._createToolbar( [
	// 				'wp_img_alignleft',
	// 				'wp_img_aligncenter',
	// 				'wp_img_alignright',
	// 				'wp_img_alignnone',
	// 				'wp_img_thepaste_upload',
	// 				'wp_img_edit',
	// 				'wp_img_remove',
	// 			] );
	// 		}
	// 	} );
	//
	// 	// setup media toolbar flyout on node change
	// 	editor.on( 'wptoolbar', function( event ) {
	// 		var uploadBtn;
	// 		if ( event.element.nodeName === 'IMG' && ! editor.wp.isPlaceholder( event.element ) ) {
	// 			event.toolbar = toolbar;
	//
	// 			uploadBtn = toolbar.$el.find('.thepaste-upload').closest('.mce-btn');
	//
	// 			if ( canUpload( event.element ) ) {
	// 				uploadBtn.show();
	// 			} else {
	// 				uploadBtn.hide();
	// 			}
	// 		}
	// 	} );
	//
	// }
	//
	// // true if data source or blob image
	// function canUpload( img ) {
	// 	var sub = img.src.substring(0,5);
	// 	return sub === 'blob:' || sub === 'data:';
	// }


	const allowedExtensions = _wpPluploadSettings.defaults.filters.mime_types[0].extensions.split(',')
	const generatePlaceholder = ( file, idx, type ) => {
		return `<img id="the-pasted-${type}-${idx}" />`
	}
	const extensionAllowed = file => {
		return !!file && allowedExtensions.includes( mime.extension( file.type ) )
	}

	let files = [],
		items = [],
		hasFiles = false

	editor
		.on( 'Paste', e => {
			console.log('### PASTE ###')
			console.log(e.clipboardData.types.join(','))
			Array
				.from(e.clipboardData.files)
				.map( file => console.log( `File: ${file.name}, Type: ${file.type}, Size: ${file.size}` ))

			Array
				.from(e.clipboardData.items)
				.map( item => {
					let result

					if ( item.kind === 'file' ) {
						result = item.getAsFile()
						!! result && console.log( `Item: ${item.kind}, Type: ${item.type}, name: ${result.name}, Type: ${result.type}, Size: ${result.size}` )
						! result && console.log(`Item: ${item.kind}, Type: ${item.type}`)
					} else {
						result = item.getAsString( s => {
							console.log( `Item: ${item.kind}, Type: ${item.type}, <${s}>` )
						})
					}
				})
			// console.log(e.clipboardData.getData())
			// // reset global vars first
			// hasFiles = false
			// files = Array.from(e.clipboardData.files).filter( extensionAllowed )
			//
			// items = Array.from(e.clipboardData.items)
			// 	.filter( item => item.kind === 'file' )
			// 	.map( item => { type: item.type } )
			//
			// hasFiles = items.length || files.length

			console.log(editor.dom.$('body').html())
			setTimeout( () => console.log(editor.dom.$('body').html()), 0 )
			setTimeout( () => console.log(editor.dom.$('body').html()), 50 )
			setTimeout( () => console.log(editor.dom.$('body').html()), 100 )
			setTimeout( () => console.log(editor.dom.$('body').html()), 500 )

		})
		.on( 'PastePreProcess', e => {
			console.log('### PASTE PRE PROCESS ###')
			/**
			@var e.content
				Firefox: filename
				Chrome: file-like object containing the file icon in 512*512px
				Safari: empty string

			@var files
				Firefox: empty array
				Chrome: array of file objects
				Safari: array of file objects
			*/
			console.log(e.content)
			// if ( ! hasFiles && ! /src="(data|blob):/.test( e.content )  ) {
			// 	return
			// }
			// const itemPointers = items
			// 	.map( (file, idx) => {
			// 		// add placeholders
			// 		return generatePlaceholder( file, idx, 'item' )
			// 		// return `<img data-the-pasted-idx="${idx}" data-mime="${file.type}" />`
			// 	} )
			// 	.join('')
			// const filePointers = files
			// 	.map( (file, idx) => {
			// 		// add placeholders
			// 		return generatePlaceholder( file, idx, 'file' )
			// 		// return `<img data-the-pasted-idx="${idx}" data-mime="${file.type}" />`
			// 	} )
			// 	.join('')
			// e.content = `<span id="the-pasted"><span id="the-pasted-content">${e.content}</span>${itemPointers}${filePointers}</span>`
		})
		.on( 'PastePostProcess', e => {
			console.log('### PASTE POST PROCESS ###')
			// upload image
			/**
			@var e.node.innerHTML
				Firefox: 'filename'
				Chrome: '<img src="blob:..." />'
				Safari: '<img src="blob:..." />'

			*/
			console.log(e.node.outerHTML)
			setTimeout( () => !!e.node && console.log(e.node.outerHTML), 0 ) //
			setTimeout( () => !!e.node && console.log(e.node.outerHTML), 50 ) //
			setTimeout( () => !!e.node && console.log(e.node.outerHTML), 100 ) //

			console.log(editor.dom.$('body').html())

// return;
// 			const dataCb = el => {
//
// 				const filename = dataImgFilename
// 				if (
// 					! tinymce.settings.paste_data_images
// 					|| ! $(el).is('[src^="data:image/"]')
// 					|| el.naturalWidth * el.naturalHeight > thepaste.options.editor.force_upload_size
// 				) {
// 					uploadPastedDataImg( el, filename )
// 				}
// 			}
// 			const blobCb = el => {
// 				if (
// 					! tinymce.settings.paste_data_images
// 					|| el.naturalWidth * el.naturalHeight > thepaste.options.editor.force_upload_size
// 				) {
// 					try {
// 						uploadPastedBlobImg( el )
// 					} catch( err ) {
// 						console.error(err)
// 					}
// 				} else {
// 					convertPastedBlobImg( el ) // <= safari dagit!
// 				}
// 			}
// console.log('awaiting',awaiting)
// console.log('files',files)
//
// 			if ( 'data' === awaiting ) {
// 				setTimeout(
// 					() => {
// 						editor.dom.$('[src^="data:"]')
// 							.each( (i,el) => {
// 								if ( el.complete ) {
// 									dataCb(el)
// 								} else {
// 									el.onload = e => dataCb(el)
// 								}
// 							} )
// 					},
// 					100
// 				)
// 			} else if ( 'blob' === awaiting ) {
//
// 				setTimeout(
// 					() => {
// 						editor.dom.$('[src^="blob:"]')
// 							.each( (i,el) => {
// 								if ( el.complete ) {
// 									blobCb(el)
// 								} else {
// 									el.onload = e => blobCb(el)
// 								}
// 							} )
// 					},
// 					100
// 				)
//
// 			} else if ( files.length ){
//
// 				setTimeout(
// 					() => {
// 						let idx, file, $el
// 						for ( idx in files ) {
// 							console.log(idx)
// 							file = files[idx]
// 							// add placeholders
// 							if ( $el = editor.$(`[id="the-pasted-${idx}"]`) ) {
// 								console.log($el)
// 								try {
// 									/*
// 									if ( tinymce.settings.paste_data_images && /image\//.test( file.type ) ) {
// 										await processPastedImage( file, el )
// 										if ( el.complete ) {
// 											dataCb( el )
// 										} else {
// 											el.onload = e => dataCb(el)
// 										}
// 									} else {
// 										await uploadPastedFile( file, el )
// 									}
// 									/*/
// 									uploadPastedFile( file, $el )
// 									//*/
// 								} catch ( err ) {
// 									console.error(err)
// 								}
// 								// upload placeholder
// 							}
// 						}
// 					},
// 					0
// 				)
// 			}
		});

} );

// } )(jQuery);
