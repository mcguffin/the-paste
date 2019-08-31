var the_pastePluginCallback;

(function($){
	the_pastePluginCallback = function( editor ) {
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

		// enable / disable autoupload
		editor.addCommand( 'cmd_thepaste', function() {
			thepaste.options.editor.auto_upload = ! thepaste.options.editor.auto_upload;
			localStorage.setItem( 'thepaste.auto_upload', thepaste.options.editor.auto_upload.toString() );
			pasteBtn.active( thepaste.options.editor.auto_upload );

		});

		// enable / disable autoupload button
		editor.addButton('thepaste', {
			icon: 'thepaste',
			tooltip: thepaste.l10n.upload_pasted_images,
			cmd : 'cmd_thepaste',
			onPostRender: function() {
				pasteBtn = this;
			},
			active:thepaste.options.editor.auto_upload
		});

		// upload button in media toolbar flyout
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

		// tru if data source or blob image
		function canUpload( img ) {
			var sub = img.src.substring(0,5);
			return sub === 'blob:' || sub === 'data:';
		}

		// setup media toolbar flyout
		editor
			.on( 'BeforePastePreProcess', function(e){
				// remove svg data
				if (  e.content.match( /&lt;svg[\s\S.]*&lt;\/svg&gt;/i ) ) {
					e.preventDefault();
					e.content = '';
				}
				return e;

			} )
			.on( 'PastePostProcess', function(e){
				// upload image
				var $firstChild, $uploadBox, el;
				/*
				if ( thepaste.options.editor.auto_upload ) {
					$firstChild = $(e.node).children().first();
					if ( $firstChild.is('img') && canUpload( $firstChild.get(0) ) ) {
					}
				}
				/*/

				$firstChild = $(e.node).children().first();
				if ( $firstChild.is('img') ) {
					el = $firstChild.get(0);
					el.onload = function(e) {
						if ( thepaste.options.editor.auto_upload || this.naturalWidth * this.naturalHeight > thepaste.options.editor.force_upload_size ) {
							$uploadBox = thepaste.uploadImage( $firstChild.get(0), editor );
							$firstChild.remove();
							$(e.node).append( $uploadBox );
						}
					}
				}

				//*/
			})
			;

	};

	tinymce.PluginManager.add( 'the_paste', the_pastePluginCallback );

} )(jQuery);
