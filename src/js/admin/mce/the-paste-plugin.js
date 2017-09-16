var thepastePluginCallback;

(function($){
	thepastePluginCallback = function( editor ) {
		var pasteBtn,
			origDomAdd,
			clipboardHasImage = false,
			currentClipboardEvent = null,
			preventImagePaste = false,
			thepaste = wp.media.thepaste,
			toolbar;

		thepaste.options.editor.auto_upload = localStorage.getItem( 'thepaste.auto_upload' ) !== 'false';
		// default on

		function domAdd() {
			var result = origDomAdd.apply(this,arguments);
			if ( 'mcepastebin' === $(result).attr('id') ) {
				$(result)
					.pastableContenteditable()
					.on('paste',function(e){
					})
					.on('pasteImage',function( e, data ) {
						var image;
						if ( preventImagePaste ) {
							e.preventDefault();
							return false;
						}
						image = thepaste.insertImage( data.dataURL, data.blob.type, editor );
						if ( thepaste.options.editor.auto_upload ) {
							thepaste.uploadImage( image, editor );
						}
					});
			}
			return result;
		}

		function setupEditorDom() {

			origDomAdd = editor.dom.add;

			editor.dom.add = domAdd;

			$(editor.dom.doc).on( 'paste', function(e){
				currentClipboardEvent = e.originalEvent;
				console.log(currentClipboardEvent.clipboardData.types);
				clipboardHasImage = thepaste.clipboardHasImage(e.originalEvent.clipboardData);
				preventImagePaste = false;
			} );
		}
		editor.addCommand( 'cmd_thepaste', function() {
			thepaste.options.editor.auto_upload = ! thepaste.options.editor.auto_upload;
			localStorage.setItem( 'thepaste.auto_upload', thepaste.options.editor.auto_upload.toString() );
			pasteBtn.active( thepaste.options.editor.auto_upload );
		});


		editor.addButton('thepaste', {
			icon: 'thepaste',
			tooltip: thepaste.l10n.upload_pasted_images,
			cmd : 'cmd_thepaste',
			onPostRender: function() {
				pasteBtn = this;
			},
			active:thepaste.options.editor.auto_upload
		});

		editor.addButton('wp_img_thepaste_upload', {
			icon: 'dashicon dashicons dashicons-upload thepaste-upload',
			tooltip: thepaste.l10n.upload_image,
			onclick: function() {
				// wrap img, upload
				var image;
				image = editor.selection.getNode();

				thepaste.uploadImage( image, editor );
			}			
		});

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

		editor.on( 'wptoolbar', function( event ) {
			var canUpload = false,
				uploadBtn;
			if ( event.element.nodeName === 'IMG' && ! editor.wp.isPlaceholder( event.element ) ) {
				event.toolbar = toolbar;
				canUpload = !! event.element.src.match( /^(blob|data):/ );
				uploadBtn = toolbar.$el.find('.thepaste-upload').closest('.mce-btn');

				if ( canUpload ) {
					uploadBtn.show();
				} else {
					uploadBtn.hide();
				}
			}
		} );

		editor
			.on( 'init', setupEditorDom )
			.on( 'BeforePastePreProcess', function(e){
				if (  e.content.match( /&lt;svg[\s\S.]*&lt;\/svg&gt;/i ) ) {
					e.preventDefault();
					e.content = '';
				}
				if ( clipboardHasImage ) {
					e.preventDefault();
					e.content = '';
				}
				return e;

			} );

	};

	tinymce.PluginManager.add( 'thepaste', thepastePluginCallback );

} )(jQuery);

