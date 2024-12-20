import mime from 'mime'
import Converter from 'converter'
import Notices from 'notices'
import { rml } from 'compat'

const allowedExtensions   = _wpPluploadSettings.defaults.filters.mime_types[0].extensions.split(',')
const maxFileSize         = Math.min( 1024*1024*200, parseInt(_wpPluploadSettings.defaults.filters.max_file_size) ) // 100MB or uplaod max filesize

const sizeAllowed = file => {
	return !!file && file.size <= maxFileSize
}
const extensionAllowed = file => {
	return !!file && allowedExtensions.includes( mime.extension( file.type ) )
}


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
			this.#removeListeners()
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
			})
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

		this.#file = rml.file(file)

	}

	destructor() {
		WPUploader.workflow.close()
	}

	upload() {
		if ( WPUploader.ready ) {
			this.#upload()
		} else {
			WPUploader.workflow.once( 'uploader:ready', () => {
				this.#upload()
			} );
		}
	}
	#upload() {
		this.#addListeners()
		WPUploader.uploader.addFile( this.#file );
		WPUploader.workflow.close()
	}

	#addListeners() {
		WPUploader.uploader.bind( 'UploadProgress', this.#progressHandler, this );
		WPUploader.uploader.bind( 'FileUploaded', this.#uploadedHandler, this );
		WPUploader.uploader.bind( 'Error', this.#errorHandler, this );
	}

	#removeListeners() {
		WPUploader.uploader.unbind( 'UploadProgress', this.#progressHandler, this );
		WPUploader.uploader.unbind( 'FileUploaded', this.#uploadedHandler, this );
		WPUploader.uploader.unbind( 'Error', this.#errorHandler, this );
	}

	dump() {
		console.log(arguments)
	}
}


const Uploader = {
	inlineUpload: async el => {

		const file = await Converter.elementToFile( el )
		const uploader = WPUploader.get(file)
		const progress = document.createElement('progress')

		progress.classList.add('the-paste-progress')

		if ( ! sizeAllowed(file) ) {
			throw new ErrorEvent('the-paste-upload', { message: `File size exceeds ${maxFileSize} byte`,  })
		}

		if ( ! extensionAllowed(file) ) {
			throw new ErrorEvent('the-paste-upload', { message: `Type ${file.type} not allowed`,  })
		}
		// dom
		progress.max = 100
		el.parentNode?.insertBefore(progress,el)
		el.remove()
		// upload process
		uploader.onProgress = percent => {
			progress.value = percent
		}
		uploader.onError = error => {
			console.error(error)
			Notices.error( `<strong>${thepaste.l10n.the_paste}:</strong> ${error.message} File: <em>${file.name}</em>`, true )
			progress.remove()
		}
		uploader.onUploaded = args => {

			const newElement = document.createElement('p')
			const attachment = args.attachment.attributes
			const link = getUserSetting( 'urlbutton', 'none' )

			if ( 'image' === attachment.type ) {
				newElement.innerHTML = wp.media.string.image( {
					link,
					align: getUserSetting( 'align', 'none' ),
					size:  getUserSetting( 'imgsize', 'medium' ),
				}, attachment )

			} else if ( 'video' === attachment.type ) {
				newElement.innerHTML = wp.media.string.video( {
					link: link !== 'none'
						? link
						: 'embed'
				}, attachment )

			} else if ( 'audio' === attachment.type ) {
				newElement.innerHTML = wp.media.string.audio( {
					link: link !== 'none'
						? link
						: 'embed'
				}, attachment )

			} else {
				newElement.innerHTML = wp.media.string.link( {
					link: link !== 'none'
						? link
						: 'file'
				}, attachment )
			}
			tinymce.activeEditor.execCommand( 'mceInsertContent', false, newElement.innerHTML );
			progress.remove()
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
		map.forEach( function(el) {
			name = name.replace( el.s, el.r )
		})
		if ( 'string' === typeof suffix) {
			name += '.' + suffix;
		}
		return name;
	}
}
module.exports = Uploader
