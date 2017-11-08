var thepastePluginCallback;

(function($){
	thepastePluginCallback = function( editor ) {
		var pasteBtn,
			origDomAdd,
			clipboardHasImage = false,
			currentClipboardEvent = null,
			preventImagePaste = false,
			thepaste = wp.media.thepaste,
			toolbar,
			pasted_image_tmp_prefix = '__pasted_image_tmp_',
			pasted_image_tmp_class = '';

		// default on
		thepaste.options.editor.auto_upload = localStorage.getItem( 'thepaste.auto_upload' ) !== 'false';

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

		function canUpload( img ) {
			var sub = img.src.substring(0,5);
			return sub === 'blob:' || sub === 'data:';
		}

		function execCommandUploadPastedImage(a){
			if ( thepaste.options.editor.auto_upload &&
				a.command == 'mceInsertContent' &&
				!! a.value && !! a.value.content &&
				"<img" === a.value.content.substring(0,4).toLowerCase()
			) {
				$img = $(editor.getBody()).find('.'+pasted_image_tmp_class);
				if ( canUpload( $img.get(0) ) ) {
					thepaste.uploadImage( $img.get(0), editor );
					$img.removeClass(pasted_image_tmp_class);
				}
			}
		}
		editor
//			.on( 'init', setupEditorDom )
			.on( 'PastePostProcess', function(e){
				var $firstChild;
				if ( thepaste.options.editor.auto_upload ) {
					$firstChild = $(e.node).children().first();
					if ( $firstChild.is('img') && canUpload( $firstChild.get(0) ) ) {
						pasted_image_tmp_class = pasted_image_tmp_prefix + Date.now();
						$firstChild.addClass( pasted_image_tmp_class );
						editor.once( 'ExecCommand', execCommandUploadPastedImage );
					}
				}
			})
			.on( 'BeforePastePreProcess', function(e){
				// remove svg data from illustrator
				if (  e.content.match( /&lt;svg[\s\S.]*&lt;\/svg&gt;/i ) ) {
					e.preventDefault();
					e.content = '';
				}
				return e;

			} )
			;

	};

	tinymce.PluginManager.add( 'thepaste', thepastePluginCallback );

} )(jQuery);
