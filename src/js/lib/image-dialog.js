import $ from 'jquery'
import ImageList from 'image-list'

const imageDialog = images => {
	return new Promise( (resolve,reject) => {
		const modal = new wp.media.view.Modal( {
			controller : {
				trigger: () => {},
			},
			title      : thepaste.l10n.the_paste
		} );
		const list = new ImageList( { files: images, controller: modal })
		list.on( 'thepaste:submit', async () => {
			const files = await list.getFiles()
			files.forEach( f=> console.log(f))
			modal.remove()
			$('body').toggleClass('the-paste-modal-open',false).toggleClass('modal-open',false)
			resolve( files )
		})
		modal.content( list );
		modal.open();
		modal.on('close', () => {
			$('body').toggleClass('the-paste-modal-open',false)
			setTimeout( () => modal.remove(), 10 )
		})
		$('body').toggleClass('the-paste-modal-open',true)
	})
}

module.exports = imageDialog
