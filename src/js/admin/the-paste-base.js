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
				imageHtml = '<img id="'+id+'" class="alignnone size-full" src="'+dataURL+'" />',
				$container;


			editor.insertContent( imageHtml );
			
			return editor.$('#'+id)[0];
		},

		uploadImage: function( image, editor ) {

			var xhr,
				workflow, 
				$container,
				src = image.src,
				upload = function( dataURL ){
					var id = '__thepaste_box_'+(counter++),
						type = dataURL.match(/^data\:([^\;]+)\;/)[1]
						file = new o.Blob( null, { data: dataURL } )
						suffix = thepaste.options.mime_types.convert[ type ];

					$(image).wrap('<div id="'+id+'" data-progress="0" class="thepaste-image-placeholder" contenteditable="false"></div>');
					$container = editor.$('#'+id);

					file.name = thepaste.l10n.pasted + '.' + suffix;
					file.type = type;

					var addFile = function(){
						workflow.uploader.uploader.uploader.addFile( file );
					}
					if ( ! workflow ) {
						workflow = wp.media.editor.open( window.wpActiveEditor, {
							frame:		'post',
							state:		'insert',
							title:		thepaste.l10n.copy_paste,
							multiple:	false
						} );

						workflow.close();

						if ( workflow.uploader.uploader && workflow.uploader.uploader.ready ) {
							addFile();
						} else {
							workflow.on( 'uploader:ready', addFile );
						}
					} else {
						workflow.state().reset();
						addFile();
					}
					workflow.uploader.uploader.uploader.bind('UploadProgress',function( e ){
						$container.attr('data-progress',e.total.percent);
					});
					workflow.uploader.uploader.uploader.bind('FileUploaded',function( up, args ){
						var imgHTML = '<img class="alignnone wp-image-'+args.attachment.id+' size-full" src="'+args.attachment.changed.url+'" />';
						// replace image
						$container.replaceWith( imgHTML );
						// replace other instances
						editor.$('img[src="'+src+'"]').each(function(){
							$(this).replaceWith( imgHTML );
						});
					});
					workflow.uploader.uploader.uploader.bind('Error',function( up, args ){
						console.log(up,args);
					});
				};

			if ( src.substr(0,5) === 'blob:' ) {

				xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onreadystatechange = function(){
					var reader;
					if ( xhr.readyState == 4 ) {
						reader = new FileReader();
						reader.onload = function() {

							upload( reader.result );

						}
						reader.readAsDataURL( xhr.response );
					}
				}
				xhr.open( 'GET', src );
				xhr.send( null );

			} else if ( src.substr(0,5) === 'data:' ) {

				upload( src );

			} 
			
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
			return null;
		}


	}, thepaste );

})( jQuery, wp.media );

