import Converter from 'converter'
import PasteOperation from 'paste-operation'
import UA from 'ua'
import imageDialog from 'image-dialog'

const thePaste = document.querySelector('#the-paste')
let uploader

const reset = () => {
	thePaste.blur()
	thePaste.innerHTML = ''
}

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
}

document.addEventListener( 'paste', e => {
	if ( document.body.matches('.the-paste-modal-open') ) {
		e.preventDefault()
	}

	if ( ! uploader ) {
		return
	}

	if (  'firefox' !== UA.browser && e.clipboardData.files.length ) {
		// Done. Except firefox.
		return handleFiles( Array.from(e.clipboardData.files) )
	}

	const pasteOp = new PasteOperation(e)
}, { capture: true } )

// enable Edit > Paste menu item ... doesn't work ...
// document.body.addEventListener('click', e => {
// 	if ( e.target.closest('a,button,select,input,[contenteditable],textarea,[tabindex]') ) {
// 		return
// 	}
// 	e.stopPropagation()
// 	document.querySelector('#the-paste').focus()
// 	console.log('aye')
// }, { capture: true } )

// firefox needs contenteditable to fire paste actions
if ( 'firefox' === UA.browser ) {
	const ctrlKey = UA.os === 'mac'
		? 'Meta'
		: 'Control'
	document.addEventListener('keydown', e => {
		if ( e.key === ctrlKey ) {
			const thePaste = document.querySelector('#the-paste')
			thePaste.focus()
			thePaste.innerHTML = ''
		}
	})
	document.addEventListener('keyup', e => {
		if ( e.key === ctrlKey ) {
			document.querySelector('#the-paste').blur()
		}
	})
	document.body.addEventListener('FilesPasted', async e => {
		// parse, upload
		const elements = thePaste.querySelectorAll('[src^="data"],[src^="blob"]')
		const files = []
		for ( const el of elements ) {
			files.push( await Converter.urlToFile( el.src, el.alt ) )
		}
		document.querySelector('#the-paste').innerHTML = ''
		handleFiles(files)
	})
}

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
		this.$('.upload-ui').append(pasteInstructions.el)
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
