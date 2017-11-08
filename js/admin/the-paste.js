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
					if ( 'undefined' === typeof suffix ) {
						console.trace( 'bad type: ' + type );
					}
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
						reader.readAsDataURL( new Blob( [ xhr.response ], { type: 'image/png' } ) );
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

(function($,exports){

	var counter      = 0,
		l10n = wp.media.thepaste.l10n;

	$.extend( wp.Uploader.prototype, {
		success : function( file_attachment ){
		}
	});


	/**
	 *	Integrate into media library modal
	 */
	// add states to browse router
	_.extend( wp.media.view.MediaFrame.Select.prototype, {
		_parentInitialize: wp.media.view.MediaFrame.Select.prototype.initialize,
		initialize: function() {
			this._parentInitialize.apply( this, arguments );
			this.bindPasteHandlers();
		},
		_parentBrowseRouter: wp.media.view.MediaFrame.Select.prototype.browseRouter,
		browseRouter : function( view ) {
			this._parentBrowseRouter.apply(this,arguments);

			if ( wp.media.thepaste.supports.paste ) {
				view.set({pasteboard:{
					text:     l10n.copy_paste,
					priority: 35
				}});
			}
		},

		bindPasteHandlers: function() {
			var previousContent = false;
		
			// dismiss content on close
			this.on( 'content:render close' , function(content){
				if ( previousContent && 'function' === typeof previousContent.dismiss ) {
					previousContent.dismiss();
				}
				if ( 'undefined' !== typeof content )
					previousContent = content;
			} , this );
		
			this.on( 'content:create:pasteboard', this.contentCreatePasteboard, this );
			this.on( 'content:render:pasteboard', this.contentRenderGrabber, this );

			frame = this;
		},
		// add handlers
		contentCreatePasteboard: function( content ) {
			var state = this.state();

			this.currentPasteView = content.view = new wp.media.thepaste.view.DataSourceImageGrabber( { 
				controller	: this, 
				grabber		: wp.media.thepaste.view.Pasteboard
			});
			this.listenTo( this.currentPasteView.uploader, 'action:uploaded:dataimage', this.uploadedDataImage );
		},
		contentRenderGrabber: function( content ) {
			content.startGrabbing();
		},
		uploadedDataImage: function( content ) {
			this.stopListening( this.currentPasteView.uploader, 'action:uploaded:dataimage' );
			var obj = { view: null };
			this.browseContent(obj);
			this.content.set( obj.view );
			this.router.get().select('browse')
		}
	});
	


	/**
	 *	Add paste button to toolbar on upload.php
	 */
	_.extend( wp.media.view.AttachmentsBrowser.prototype, {
		_parentInitialize:	wp.media.view.AttachmentsBrowser.prototype.initialize,
		initialize:	function() {
			var self = this,
				pasteBtn;

			this._parentInitialize.apply(this,arguments);
			
			this.thepaste = {
				paste	: {
//					button	: false,
					grabber	: false,
					modal	: false,
					mode	: 'paste',
				},
				current		: false
			}

			if ( ! ( this.controller instanceof wp.media.view.MediaFrame.Select ) ) {

				if ( wp.media.thepaste.supports.paste ) {

					pasteBtn = new wp.media.view.Button( {
						text		: l10n.copy_paste,
						className:  'grabber-button',
						priority	: -64,
						click: function() {
							self.thepaste.active = self.thepaste.paste;
							self.thepasteOpen( l10n.copy_paste );
						}
					} );
					this.thepaste.paste.grabber = new wp.media.thepaste.view.DataSourceImageGrabber( {
						controller	: this.controller,
						grabber		: wp.media.thepaste.view.Pasteboard,
						wpuploader	: this.controller.uploader.uploader.uploader
					} );

					this.toolbar.set( 'pasteModeButton', pasteBtn.render() );
				}
			}
		},
		thepasteUploaded: function( e ) {
			this.thepaste.active.grabber.dismiss();
			this.thepaste.modal.close();
			this.thepasteClose();
		},
		thepasteError: function( e ) {
			console.log( 'error', e );
		},
		thepasteOpen: function( title ) {
			var self = this;

			this.thepaste.modal  =  new wp.media.view.Modal( {
				controller : this,
				title      : title
			} );
			this.thepaste.modal.content( this.thepaste.active.grabber );
			this.thepaste.modal.open();

			this.thepaste.modal.on( 'close', function() {
				self.thepasteClose.apply(self);
				self.thepaste.active.grabber.stopGrabbing();
			});

			this.thepaste.active.grabber.startGrabbing();

			this.listenTo( this.thepaste.active.grabber.uploader, 'action:uploaded:dataimage', this.thepasteUploaded );
			this.listenTo( this.thepaste.active.grabber.uploader, 'error:uploaded:dataimage', this.thepasteError );
		},
		thepasteClose: function() {

			this.controller.deactivateMode( this.thepaste.active.mode ).activateMode( 'edit' );

			this.stopListening( this.thepaste.active.grabber.uploader, 'action:uploaded:dataimage' );
			this.stopListening( this.thepaste.active.grabber.uploader, 'error:uploaded:dataimage' );
		}
	});
	
})(jQuery,window);

(function($,window,o){
	var thepaste = wp.media.thepaste,
		Button = wp.media.view.Button,
		Modal  = wp.media.view.Modal,
		l10n   = thepaste.l10n;


	wp.media.thepaste.view.DataSourceImageUploader = wp.media.View.extend({
		template: wp.template('thepaste-uploader'),
		className: 'thepaste-uploader',
		controller:null,
		image : null,
		$discardBtn : null,
		$uploadBtn : null,
		
		uploader : null,
		
		events : {
			'click [data-action="upload"]'	: 'uploadImage',
			'click [data-action="discard"]'	: 'discardImage',
		},
		initialize : function() {

			wp.media.View.prototype.initialize.apply( this, arguments );

			_.defaults( this.options, {
				defaultFileName : l10n.image
			});
			var self = this,
				instr = new wp.media.View({
				tagName    : 'div',
				className  : 'instruments',
				controller : this.controller
			});

			this.uploader = this.options.uploder;
		},
		setImageData : function( data ) {
			var container = this.$imageContainer.html('').get(0),
				self = this,
				format = data.match(/data:(image\/(\w+));/)[1];

			if ( ! thepaste.options.mime_types.convert[format] ) {
				format = this.options.defaultFileFormat;
			}
			
			if ( this.image ) {
				this.image.destroy();
			}

			this.image = new o.Image();
			this.image.onload = function() {
				var opts = self.getUploader().getOption('resize'),
					scale = Math.max( opts.width / this.width, opts.height / this.height );

				!!opts && (scale < 1) && this.downsize( this.width*scale, this.height*scale );

				this.embed( container );
			}

			this.image.load( data );
			if ( this.$imageContainer ) {
				this.$imageContainer.append(this.image);
			}
			this.$('[data-setting="format"] input[value="'+format+'"]').prop( 'checked', true );


			this.disabled(false);
			return this;
		},
		render : function() {
			wp.media.View.prototype.render.apply(this,arguments);
			this.$imageContainer = this.$('.image-container');
			this.$discardBtn = this.$('[data-action="discard"]');
			this.$uploadBtn = this.$('[data-action="upload"]');
			this.$('[data-setting="title"]').val( this.options.defaultFileName );
			return this;
		},
		discardImage : function(){
			this.trigger( 'action:discard:dataimage' , this );
			this.unbindUploaderEvents();
		},
		uploadImage : function() {

			var type = this.$('[data-setting="format"] :checked').val(),
				suffix = thepaste.options.mime_types.convert[ type ],
				name = this.$('input[data-setting="title"]').val() + '.' + suffix,
				blob = this.image.getAsBlob( type, thepaste.options.jpeg_quality );

			this.bindUploaderEvents();

			blob.detach( blob.getSource() );
			blob.name = name;
			blob.type = type;
			this.getUploader().addFile( blob , name );

			this.disabled( true );

			this.trigger( 'action:upload:dataimage' , this );
		},
		show:function(){
			this.$el.show();
			return this;
		},
		hide:function(){
			this.$el.hide();
			return this;
		},
		disabled : function( disabled ) {
			this.$discardBtn.prop( 'disabled', disabled );
			this.$uploadBtn.prop( 'disabled', disabled );
		},
		_uploadSuccessHandler : function() {
			this.trigger( 'action:uploaded:dataimage' );
			this.disabled(false);
			this.unbindUploaderEvents();
		},
		_uploadErrorHandler : function() {
			this.trigger( 'error:uploaded:dataimage' );
			this.disabled(false);
			this.unbindUploaderEvents();
		},
		bindUploaderEvents : function() {
			this.getUploader().bind( 'FileUploaded',	this._uploadSuccessHandler,	this );
			this.getUploader().bind( 'Error',			this._uploadErrorHandler,	this );
		},
		unbindUploaderEvents : function() {
			this.getUploader().unbind( 'FileUploaded',	this._uploadSuccessHandler,	this );
			this.getUploader().unbind( 'Error',			this._uploadErrorHandler,	this );
		},
		getUploader: function() {
			return this.controller.uploader.uploader.uploader;
		}
	});


	wp.media.thepaste.view.Pasteboard = wp.media.View.extend({
		template: wp.template('thepaste-pasteboard'),
		className: 'thepaste-pasteboard',
		controller:null,
		action:'paste',
		$pasteboard : null,

		render: function() {
			var self = this;
			wp.media.View.prototype.render.apply(this,arguments);
			this.$pasteboard = this.$( '.injector' ).pastableContenteditable();
			this.$message = this.$( '.message' );
			this.$pasteboard.on('click', function(){
				self.show_message('');
			} );
			return this;
		},
		start : function() {
			var self = this,
				clipboardHasImage;

			this.imagePasted = false;

			this.$pasteboard
				.on('paste',function(e){
					clipboardHasImage = wp.media.thepaste.clipboardHasImage(e.originalEvent.clipboardData);
				})
				.on('pasteText' , function( e, data ) {

					if ( clipboardHasImage || self.imagePasted ) {
						return;
					}
					self.show_message( l10n.paste_error_no_image );
					$( this ).html('');
				} )
				.on('pasteImage' , function( e, data ) {
					if ( self.imagePasted ) {
						return;
					}
					self.trigger( 'action:create:dataimage', this , data.dataURL );
					self.imagePasted = true;
				} )
				.on('pasteImageError' , function( e, data ) {
					self.show_message( l10n.paste_error );
					$( this ).html('');
				} )
				;

			setTimeout(function(){
				self.$pasteboard.get(0).focus();
			},1);

			return this;
		},
		stop : function() {
			this.$pasteboard
				.off('pasteImage')
				.off('pasteImageError')
				.off('pasteText');
			return this;
		},
		show:function() {
			this.$el.show();
			return this;
		},
		hide:function() {
			this.$el.hide();
			return this;
		},
		show_message:function( msg ) {
			this.$message.text( msg );
		}
	});

	wp.media.thepaste.view.DataSourceImageGrabber = wp.media.View.extend({
//		tagName:   'div',
		template: wp.template('thepaste-grabber'),
		className : 'thepaste-grabber',
		
		grabber : null,
		uploader : null,
		
		initialize : function() {
			var ret = wp.media.View.prototype.initialize.apply( this, arguments );

			_.defaults( this.options, {
				wpuploader		: null,
				defaultFileName	: l10n.pasted,
				defaultFileFormat : 'image/png',
				title			: l10n.copy_paste 
			});

			this.grabber  = new this.options.grabber( { controller	: this.controller } );

			this.uploader = new wp.media.thepaste.view.DataSourceImageUploader( {	
									controller			: this.controller,
									uploder				: this.options.wpuploader,
									defaultFileName		: this.options.defaultFileName,
									defaultFileFormat	: this.options.defaultFileFormat
								});
			this.render();

			this.listenTo( this.grabber, 'action:create:dataimage',	this.imageCreated );
			this.listenTo( this.uploader, 'action:discard:dataimage',	this.startGrabbing );

			return ret;
		},
		render:function(){
			var self = this;

			wp.media.View.prototype.render.apply( this, arguments );

			this.$('.content')
				.append( this.grabber.render().$el )
				.append( this.uploader.render().$el );

			return this;
		},
		imageCreated : function( grabber , imageData ) {
			this.grabber.stop().hide();
			this.uploader.show().setImageData( imageData );
		},
		startGrabbing:function() {
			this.uploader.hide();
			this.grabber.show().start();
			return this;
		},
		stopGrabbing:function() {
			this.grabber.stop();
			return this;
		},
		getAction : function() {
			return this.grabber.action;
		},
		dismiss:function() {
			this.grabber.stop();
			return this;
		}
	});

})(jQuery,window,mOxie);
