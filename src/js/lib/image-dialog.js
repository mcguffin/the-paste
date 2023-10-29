import $ from 'jquery'
import ImageList from 'image-list'

let modal = null
let list  = null

const imageDialog = images => {
	return new Promise( (resolve,reject) => {
		if ( modal !== null ) {
			list.addFiles(images)
			resolve([])
			return
		}
		modal = new wp.media.view.Modal( {
			events: {
				'keydown': function(e) {
					if ( e.key === 'Enter' ) {
						list.submit()
					} else if ( e.key === 'Escape' ) {
						modal.close()
					}
				},
				'click .media-modal-close': function(e) {
					modal.close()
				}
			},
			controller : {
				trigger: () => {},
			},
			title      : thepaste.l10n.the_paste
		} );
		list = new ImageList( { controller: modal })
		const isModal = $('body').is('.modal-open')
		list.on( 'thepaste:submit', async () => {
			const files = await list.getFiles()
			modal.close()
			// $('body').toggleClass( 'the-paste-modal-open', false ) // block editor
			// $('body').toggleClass( 'modal-open', isModal ) // restore preious modal state
			resolve( files )
		})
		list.on('thepaste:cancel',() => modal.close() )
		modal.content( list );
		list.addFiles(images)
		modal.open();
		modal.on('close', () => {
			$('body').toggleClass( 'the-paste-modal-open', false )
			$('body').toggleClass( 'modal-open', isModal )
			// setTimeout( () => {
				modal.remove()
				modal = null
				console.log('closed',modal)
			// }, 10 )
		})
		$('body').toggleClass( 'the-paste-modal-open', true )
	})
}

module.exports = imageDialog
