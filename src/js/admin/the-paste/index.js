import Converter from 'converter'
import imageDialog from 'image-dialog'
import { rml } from 'compat'
let uploader

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

_.extend( wp.media.view.MediaFrame.prototype, {
	_parentInitialize:	wp.media.view.MediaFrame.prototype.initialize,
	initialize: function(title) {
		this._parentInitialize.apply(this,arguments);
		this.on( 'attach', this.addPasteInstructions, this );
		this.pasteInstructions = new PasteInstructions()
		this.pasteInstructions.render()
	},
	addPasteInstructions: function() {
		this.$el.find('#media-frame-title').append(this.pasteInstructions.el)
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

		document.addEventListener( 'paste', async e => {

			if ( ! this.$el.is(':visible') ) {
				return;
			}

			const files = Array.from( e.clipboardData.files )
			files.push( ... await Converter.clipboardItemsToFiles( e.clipboardData.items ) ) // why did we do this?

			if ( files.length ) {
				return await this.handlePastedFiles( files )
			}

		}, { capture: true } )
	},
	handlePastedFiles: async function(files) {
		const images = [],
			uploader = this.controller.uploader.uploader.uploader
		files.forEach( file => {
			if ( /^image\//.test( file.type ) ) {
				images.push(file)
			} else {
				uploader.addFile( rml.file(file) )
			}
		} )
		if ( images.length ) {
			const uploadFiles = await imageDialog( images )
			uploadFiles.forEach( file => uploader.addFile( rml.file(file) ) )
		}
	}
})
