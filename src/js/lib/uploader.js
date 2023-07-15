import mime from 'mime-types'
import Converter from 'converter'
import Notices from 'notices'

class WPUploader {
	static #workflow
	onUploaded = () => {}
	onProgress = () => {}
	onError    = () => {}
	#file

	#progressHandler = (up,args) => {
		if ( this.#isitMe(args) ) {
			this.onProgress( args.percent )
		}
	}
	#uploadedHandler = ( up, args, response ) => {
		if ( this.#isitMe(args) ) {
			this.onUploaded( args )
		}
	}
	#errorHandler = ( up, args, c = 0 ) => {
		if ( this.#isitMe(args) ) {
			this.onError(args)
		}
	}

	#isitMe(args) {
		return this.#file.name === args.name && this.#file.size === args.size
	}

	static get ready() {
		return !! WPUploader.workflow.uploader.uploader && !! WPUploader.workflow.uploader.uploader.ready
	}

	static get workflow() {
		if ( ! WPUploader.#workflow ) {
			WPUploader.#workflow = wp.media.editor.open( window.wpActiveEditor, {
				frame:    'post',
				state:    'insert',
				title:    thepaste.l10n.copy_paste,
				multiple: false
			} ).close();
		}
		return WPUploader.#workflow
	}

	static get uploader() {
		return WPUploader.workflow.uploader.uploader.uploader
	}

	static get(file) {
		return new WPUploader(file)
	}

	constructor(file) {

		// sanitize file
		if ( ! file.name ) {
			file.name = Uploader.getFilename( mime.extension(file.type) )
		}

		this.#file = file

		WPUploader.uploader.bind( 'UploadProgress', this.#progressHandler, this );
		WPUploader.uploader.bind( 'FileUploaded', this.#uploadedHandler, this );
		WPUploader.uploader.bind( 'Error', this.#errorHandler, this );
	}

	destructor() {
		console.log('destruct')
		WPUploader.uploader.unbind( 'UploadProgress', this.#progressHandler, this );
		WPUploader.uploader.unbind( 'FileUploaded', this.#uploadedHandler, this );
		WPUploader.uploader.unbind( 'Error', this.#errorHandler, this );
	}

	upload() {
		if ( WPUploader.ready ) {
			WPUploader.uploader.addFile( [this.#file] );
		} else {
			WPUploader.workflow.once( 'uploader:ready', () => {
				WPUploader.uploader.addFile( [this.#file] )
			} );
		}
	}
}


const Uploader = {
	inlineUpload: async el => {
		const file = await Converter.elementToFile( el )
		const uploader = WPUploader.get(file)
		const wrapper = document.createElement('div')
		const progress = document.createElement('progress')

		// dom
		wrapper.classList.add('the-pasted-wrapper')
		progress.max = 100
		wrapper.appendChild(progress)
		el.parentNode.insertBefore(wrapper,el)
		el.remove()

		// upload process
		uploader.onProgress = percent => {
			progress.value = percent
		}
		uploader.onError = error => {
			Notices.error( `<strong>${thepaste.l10n.the_paste}:</strong> ${error.message} File: <em>${file.name}</em>`, true )
			wrapper.remove()
		}
		uploader.onUploaded = args => {

			const newElement = document.createElement('p')
			const attachment = args.attachment.attributes

			if ( 'image' === attachment.type ) {
				newElement.innerHTML = wp.media.string.image( {}, attachment )
			} else if ( 'video' === attachment.type ) {
				newElement.innerHTML = wp.media.string.video( { link: 'embed' }, attachment )
			} else if ( 'audio' === attachment.type ) {
				newElement.innerHTML = wp.media.string.audio( { link: 'embed' }, attachment )
			} else {
				newElement.innerHTML = wp.media.string.link( {}, attachment )
			}
			/*
			wp.media.post( 'send-attachment-to-editor', {
				nonce:      wp.media.view.settings.nonce.sendToEditor,
				attachment: attachment,
				html:       html,
				post_id:    wp.media.view.settings.post.id
			})
			.then( html => $body.find(`[data-id="${id}"]`).replaceWith( `<p>${html}</p>` ) );
			/*/
			wrapper.replaceWith( newElement.childNodes[0] )
			//*/
		}
		uploader.upload()
	},
	/**
	 *	Generate a filename
	 */
	getFilename: suffix => {

		const zerofill = (n,len = 2) => {
			return ('00' + n.toString()).substr(-len)
		}

		let name = thepaste.options.default_filename

		const now = new Date(),
			postname = document.querySelector('#post [name="post_title"]#title').value,
			username = document.querySelector('.display-name').textContent,
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
		console.log(name,suffix)
		return name;
	}
}
module.exports = Uploader
