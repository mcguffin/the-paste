(function( $, exports, o ) {

	var is_chrome	= navigator.userAgent.indexOf('Chrome') > -1,
		counter = 0,
		workflow;

	function zerofill(n) {
		return ('00' + n.toString()).substr(-2)
	}

	thepaste = exports.thepaste = $.extend( {
		supports : {
			paste: ( ('paste' in document) || ('onpaste' in document) || typeof(window.onpaste) === 'object' || ( 'onpaste' in document.createElement('DIV') ) ), // browser
		},
		view:{},

		uploadImage: function( image, editor, upload_placeholder ) {

			var id = '__thepaste_box_'+(counter++),
				$container = $(image)
					.wrap('<div id="'+id+'" data-progress="0" class="thepaste-image-placeholder" contenteditable="false"></div>')
					.parent();

				// set $container size once known
				image.onload = function() {
					$( editor.$('#'+id) ).width( this.naturalWidth );
					$( editor.$('#'+id) ).height( this.naturalHeight );
				}

			var xhr,
				workflow,
				src = image.src,
				sub = src.substr(0,5),
				upload = function( dataURL ){
					var type = dataURL.match(/^data\:([^\;]+)\;/)[1],
						file = new o.Blob( null, { data: dataURL } ),
						suffix = thepaste.options.mime_types.convert[ type ];
					if ( 'undefined' === typeof suffix ) {
						console.trace( 'Won\'t upload, bad mime type: ' + type );
					}

					file.name = thepaste.getFilename(suffix)
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
						editor.$('#'+id).attr('data-progress',e.total.percent);
					});
					workflow.uploader.uploader.uploader.bind('FileUploaded',function( up, args ){

						var $container = editor.$('#'+id),
							imgHTML = '<img class="alignnone wp-image-'+args.attachment.id+' size-full" src="'+args.attachment.changed.url+'" />';

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

			if ( sub === 'blob:' ) {

				xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.onreadystatechange = function(){
					var reader;
					if ( xhr.readyState == 4 ) {
						reader = new FileReader();
						reader.onload = function() {
							upload( reader.result );
						}
						reader.readAsDataURL( new Blob( [ xhr.response ], { type: 'image/png' } ) );
					}
				}
				xhr.open( 'GET', src );
				xhr.send( null );

			} else if ( sub === 'data:' ) {
				upload( src );
			}
			return $container;
		},

		getFilename: function( suffix ) {
			var name = thepaste.options.default_filename,
				now = new Date(),
				p,
				postname = $('#post [name="post_title"]#title').val(),
				username = $('.display-name:first').text(),
				map = [
					{ s: '%Y', r: now.getFullYear() },
					{ s: '%y', r: now.getFullYear() % 100 },
					{ s: '%m', r: zerofill(now.getMonth() + 1) },
					{ s: '%d', r: zerofill(now.getDate()) },
					{ s: '%e', r: now.getDate() },
					{ s: '%H', r: zerofill(now.getHours()) },
					{ s: '%I', r: zerofill(now.getHours() % 12 ) },
					{ s: '%M', r: zerofill(now.getMinutes()) },
					{ s: '%S', r: zerofill(now.getSeconds()) },
					{ s: '%s', r: Math.floor( now.getTime() / 1000 ) }
				];
			if ( 'undefined' !== typeof postname ) {
				map.push( { s: '<postname>', r: postname } );
			} else {
				map.push( { s: '<postname>', r: '' } );
			}
			if ( 'undefined' !== typeof username ) {
				map.push( { s: '<username>', r: username } );
			} else {
				map.push( { s: '<username>', r: '' } );
			}
			map.forEach(function(el){
				name = name.replace( el.s, el.r )
			})
			if ( 'string' === typeof suffix) {
				name += '.' + suffix;
			}
			return name;
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

})( jQuery, wp.media, mOxie );
