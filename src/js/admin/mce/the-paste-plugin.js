var thepastePluginCallback;

(function($){
	thepastePluginCallback = function( editor ) {
		var pasteBtn,
			active = false,
			origDomAdd,
			clipboardHasImage = false,
			currentClipboardEvent = null,
			preventImagePaste = false;

		function domAdd() {
			var result = origDomAdd.apply(this,arguments);
			if ( 'mcepastebin' === $(result).attr('id') ) {
				$(result)
					.pastableContenteditable()
					.on('paste',function(e){
					})
					.on('pasteImage',function( e, data ) {
						if ( preventImagePaste ) {
							e.preventDefault();
							return false;
						}
						wp.media.thepaste.insertImage( data.dataURL, data.blob.type, editor );
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
				clipboardHasImage = wp.media.thepaste.clipboardHasImage(e.originalEvent.clipboardData);
				preventImagePaste = false;
			} );
		}
		editor.addCommand( 'cmd_thepaste', function() {
			var editor_body;

			active = ! active;
			pasteBtn.active( active );
		});


		editor.addButton('thepaste', {
			icon: 'thepaste',
			tooltip: '',
			cmd : 'cmd_thepaste',
			onPostRender: function() {
				pasteBtn = this;
			}
		});

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

