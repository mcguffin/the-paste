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
			this.on( 'content:create:dataimage', this.contentRenderGrabber, this );

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
		},
		imagePasted:function(){
			// enable insert btn
			// clear selection
			console.log(this)

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
		thepasteOpen: function( title ) {
			var self = this;

			this.thepaste.modal  =  new wp.media.view.Modal( {
				controller : this,
				title      : title
			} );
			this.thepaste.modal.content( this.thepaste.active.grabber );
			this.thepaste.modal.open();

			this.thepaste.modal.on( 'close', function() {
				self.thepasteClose();
				self.thepaste.active.grabber.stopGrabbing();
			});

			this.thepaste.active.grabber.startGrabbing();

			this.listenTo( this.thepaste.active.grabber.uploader, 'action:upload:dataimage', this.thepasteClose );
		},
		thepasteClose: function() {
			this.thepaste.modal.close();

			this.stopListening( this.thepaste.active.grabber.uploader, 'action:upload:dataimage' );
		}
	});

})(jQuery,window);
