(function($,exports){

	var is_chrome	= navigator.userAgent.indexOf('Chrome') > -1,
		counter = 0,
		workflow;
		
	thepaste = exports.thepaste = $.extend( {
		supports : {
			paste: ( ('paste' in document) || ('onpaste' in document) || typeof(window.onpaste) === 'object' || ( 'onpaste' in document.createElement('DIV') ) ), // browser
		},
		view:{},
		
		insertImage:function( dataURL, type, editor ) {
			var id = '__thepaste_img_'+(counter++),
				image = new Image(),
				blob = new mOxie.File( null, { data: dataURL } ),
				imageHtml = '',
				$container;

			imageHtml += '<div class="thepaste-image-placeholder" id="'+id+'" contenteditable="false">';
			imageHtml += '<img class="alignnone size-full" src="'+dataURL+'" />';
			imageHtml += '</div>';
			image.onload = function() {
				thepaste.uploadImage( blob, $container );
			}
			image.src = dataURL;

			editor.insertContent( imageHtml );
			$container = editor.$('#'+id);
		},
		uploadImage: function( image, $container ) {

			var type = image.type, 
				suffix = thepaste.options.mime_types.convert[ type ],
				name = thepaste.l10n.pasted + '.' + suffix,
				blob = image instanceof mOxie.File ? image : image.getAsBlob( type, thepaste.options.jpeg_quality ),
				addFile = function(){
					workflow.uploader.uploader.uploader.addFile( blob );
					workflow.close()
				};

//			blob.detach( blob.getSource() );
			blob.name = name;
			blob.type = type;

			if ( ! workflow ) {
				workflow = wp.media.editor.open( window.wpActiveEditor, {
					frame:		'post',
					state:		'insert',
					title:		thepaste.l10n.copy_paste,
					multiple:	false
				} );
				if ( workflow.uploader.uploader && workflow.uploader.uploader.ready ) {
					addFile();
				} else {
					workflow.on( 'uploader:ready', addFile );
				}
			} else {
				workflow.state().reset();
				addFile();
			}
			workflow.uploader.uploader.uploader.bind('UploadProgress',function(e){
				$container.attr('data-progress',e.total.percent);
			});
			workflow.uploader.uploader.uploader.bind('FileUploaded',function(e,args){
				$container.replaceWith( '<img class="alignnone wp-image-'+args.attachment.id+' size-full" src="'+args.attachment.changed.url+'" />' );
			});
			workflow.uploader.uploader.uploader.bind('Error',function(e,args){
				console.log(e,args);
			});
		},
		/**
		 *	@return: null|true|false
		 */
		clipboardHasImage:function( clipboardData ) {
			var hasImage = false;
			if ( clipboardData.items ) {
				$.each( clipboardData.items, function(i,item){
					if ( item.type in thepaste.options.mime_types.paste ) {
						hasImage = true;
						return false;
					}
				} );
				return hasImage;
			}

			if ( clipboardData.types ) {
				$.each( thepaste.options.mime_types.paste, function(type,ext){
					if ( clipboardData.types.indexOf(type) > -1 ) {
						hasImage = true;
						return false;
					}
				} );
				return hasImage;
			}
			console.log(clipboardData);
			return null;
		}
		

	}, thepaste );

})( jQuery, wp.media );

