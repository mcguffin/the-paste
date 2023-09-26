import Converter from 'converter'
import UA from 'ua'
import imageDialog from 'image-dialog'

let uploader

const handleFiles = files => {
	const images = []
	files.forEach( file => {
		if ( /^image\//.test( file.type ) ) {
			images.push(file)
			// uploader.addFile( file )
		} else {
			uploader.addFile( file )
		}
	} )
	if ( images.length ) {
		imageDialog( images )
			.then( files => files.forEach( file => uploader.addFile( file ) ) )
	}
};


document.addEventListener( 'paste', async e => {
	if ( document.body.matches('.the-paste-modal-open') ) {
		e.preventDefault()
	}

	if ( ! uploader ) {
		return
	}

	const files = Array.from( e.clipboardData.files )
	files.push( ... await Converter.gdocsClipboardItemsToFiles( e.clipboardData.items ) )

	if ( files.length ) {
		return handleFiles( files )
	}

}, { capture: true } )


// Show paste notice in media library
const PasteInstructions = wp.media.View.extend({
	template: wp.template('the-paste-instructions'),
	className: 'the-paste-instructions',
	render: function() {
		wp.media.View.prototype.render.apply(this,arguments);
		setInterval( () => {
			this.$el.prop('hidden', ! document.hasFocus() )
		}, 100 )
	}
})

_.extend( wp.media.view.UploaderInline.prototype, {
	_parentRender:	wp.media.view.UploaderInline.prototype.render,
	render:	function() {
		this._parentRender.apply(this,arguments);
		const pasteInstructions = new PasteInstructions()
		pasteInstructions.render()
		this.$('.upload-ui').append( pasteInstructions.el )
	}
})

// set uploader global var
_.extend( wp.media.view.AttachmentsBrowser.prototype, {
	_parentInitialize:	wp.media.view.AttachmentsBrowser.prototype.initialize,
	initialize:	function() {
		this._parentInitialize.apply(this,arguments);

		const pasteInstructions = new PasteInstructions({
			priority : -10,
		})
		pasteInstructions.render()
		this.toolbar.set( 'pasteInstructions', pasteInstructions );

		if ( !! this.controller.uploader.uploader ) {
			uploader = this.controller.uploader.uploader.uploader
		} else {
			setTimeout( () => {
				uploader = this.controller.uploader.uploader.uploader
			}, 50 )
		}
	}
})
