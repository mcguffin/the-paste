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
			
			if ( thepaste.options.editor.auto_upload ) {
				thepaste.uploadImage( editor.$('#'+id).get(0), editor );
			}
		},
/*
btoaUnicode: function(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa( encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    } ) );
},
/*/
btoaUnicode: function(string) {
return btoa(unescape(encodeURIComponent(string)));
    var string = btoa(unescape(encodeURIComponent(string))),
        charList = string.split(''),
        uintArray = [];
    for (var i = 0; i < charList.length; i++) {
        uintArray.push(charList[i].charCodeAt(0));
    }
    return new Uint8Array(uintArray);
},
//*/
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
						// replace main image
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
			
				//*
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

				/*/
				$.ajax({
					method:'GET',
					url:image.src,
					accepts:'arraybuffer', // arraybuffer
    				success:function( response, success, xhr ) {
						var type = xhr.getResponseHeader('content-type'),
							b64 = thepaste.btoaUnicode( xhr.responseText );
						upload( 'data:' + type + ';base64,' + b64 );
						console.log(escape(response.substring(0,50)),b64.substring(0,50));
						
					}
				});
				//*/

			} else if ( src.substr(0,5) === 'data:' ) {

				upload( src );

			} else if ( src.match( /^https?:/ ) ) {
				// only from foreign servers
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
			console.log(clipboardData);
			return null;
		}
		

	}, thepaste );
console.log(thepaste);
})( jQuery, wp.media );

