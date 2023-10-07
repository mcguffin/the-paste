import $ from 'jquery'
import ImageList from 'image-list'

const imageDialog = images => {
	return new Promise( (resolve,reject) => {
		const modal = new wp.media.view.Modal( {
			events: {
				'keydown': function(e) {
					if ( e.key === 'Enter' ) {
						list.submit()
					} else if ( e.key === 'Escape' ) {
						modal.close()
					}
				}
			},
			controller : {
				trigger: () => {},
			},
			title      : thepaste.l10n.the_paste
		} );
		const list = new ImageList( { files: images, controller: modal })
		const isModal = $('body').is('.modal-open')
		list.on( 'thepaste:submit', async () => {
			const files = await list.getFiles()
			modal.remove()
			$('body').toggleClass( 'the-paste-modal-open', false ) // block editor
			$('body').toggleClass( 'modal-open', isModal ) // restore preious modal state
			resolve( files )
		})
		modal.content( list );
		modal.open();
		modal.on('close', () => {
			$('body').toggleClass( 'the-paste-modal-open', false )
			$('body').toggleClass( 'modal-open', isModal )
			setTimeout( () => modal.remove(), 10 )
		})
		$('body').toggleClass( 'the-paste-modal-open', true )
	})
}

module.exports = imageDialog
