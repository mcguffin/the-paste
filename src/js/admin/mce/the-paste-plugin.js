var thepastePluginCallback;

(function($){
	thepastePluginCallback = function( editor ) {
		var pasteBtn,
			active = false,
			origDomAdd,
			thepaste = top.thepaste;

		function domAdd() {
			var result = origDomAdd.apply(this,arguments);
			if ( 'mcepastebin' === $(result).attr('id') ) {
				$(result)
					.pastableContenteditable()
					.on('paste',function(e){
					})
					.on('pasteImage',function( e, data ) {
						wp.media.thepaste.insertImage( data.dataURL, data.blob.type, editor );
					});
			}
			return result;
		}

		function setupEditorDom() {
			origDomAdd = editor.dom.add;

			editor.dom.add = domAdd;
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

		editor.on( 'init', setupEditorDom );

	};

	tinymce.PluginManager.add( 'thepaste', thepastePluginCallback );

} )(jQuery);

