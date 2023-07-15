import mime from 'mime-types'
import Notices from 'notices'
import $ from 'jquery'

class ThePaste {
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
		return !! ThePaste.workflow.uploader.uploader && !! ThePaste.workflow.uploader.uploader.ready
	}

	static get workflow() {
		if ( ! ThePaste.#workflow ) {
			ThePaste.#workflow = wp.media.editor.open( window.wpActiveEditor, {
				frame:    'post',
				state:    'insert',
				title:    thepaste.l10n.copy_paste,
				multiple: false
			} ).close();
		}
		return ThePaste.#workflow
	}

	static get uploader() {
		return ThePaste.workflow.uploader.uploader.uploader
	}

	static get(file) {
		return new ThePaste(file)
	}

	constructor(file) {

		// sanitize file
		if ( ! file.name ) {
			file.name = getFilename( mime.extension(file.type) )
		}

		this.#file = file

		ThePaste.uploader.bind( 'UploadProgress', this.#progressHandler, this );
		ThePaste.uploader.bind( 'FileUploaded', this.#uploadedHandler, this );
		ThePaste.uploader.bind( 'Error', this.#errorHandler, this );
	}

	destructor() {
		console.log('destruct')
		ThePaste.uploader.unbind( 'UploadProgress', this.#progressHandler, this );
		ThePaste.uploader.unbind( 'FileUploaded', this.#uploadedHandler, this );
		ThePaste.uploader.unbind( 'Error', this.#errorHandler, this );
	}

	upload() {
		if ( ThePaste.ready ) {
			ThePaste.uploader.addFile( [this.#file] );
		} else {
			ThePaste.workflow.once( 'uploader:ready', () => {
				ThePaste.uploader.addFile( [this.#file] )
			} );
		}
	}

}

let workflow

const zerofill = (n,len = 2) => {
	return ('00' + n.toString()).substr(-len)
}

/**
 *	Generate a filename
 */
const getFilename = suffix => {
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

const dataUrlToFile = ( dataurl, filename = '' ) => {


	let arr = dataurl.split(','),
		type = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);

	if ( ! filename.trim() ) {
		filename = getFilename( mime.extension(type) )
	}

	while(n--){
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: type });

// 	const arr = dataurl.split(','),
// 		mime = arr[0].match(/:(.*?);/)[1],
// 		bstr = atob(arr[arr.length - 1]),
// 		u8arr = new Uint8Array(n);
// 	let n = bstr.length, f
// console.log(n)
// 	while(n--){
// 		u8arr[n] = bstr.charCodeAt(n);
// 	}
// 	f = new Blob( [u8arr], { type: mime } );
// console.log(f,n)
// 	return f
}

const blobUrlToFile = async ( blobUrl ) => {
	const blob = await fetch(blobUrl).then( r => r.blob() );
	return new File([blob], getFilename( mime.extension(blob.type) ), {type:blob.type});
}
//
// const upload = (file, completeCB = () => {}, progressCb = () => {}) => {
//
//
// 	const addFile = () => workflow.uploader.uploader.uploader.addFile( [file] );
// 	const getFile = () => file
//
// 	if ( ! workflow ) {
// 		workflow = wp.media.editor.open( window.wpActiveEditor, {
// 			frame:    'post',
// 			state:    'insert',
// 			title:    thepaste.l10n.copy_paste,
// 			multiple: false
// 		} ).close();
//
// 		workflow.uploader.uploader.uploader.bind('UploadProgress',e => {
// 			progressCb(e.total.percent)
// 		});
//
// 		workflow.uploader.uploader.uploader.bind('FileUploaded', ( up, args ) => {
// 			completeCB( args, getFile() )
// 		});
// 		workflow.uploader.uploader.uploader.bind('Error',( up, args ) => {
// 			console.error(args)
// 			throw args
// 		});
//
// 	}
// 	if ( workflow.uploader.uploader && workflow.uploader.uploader.ready ) {
//
// 		addFile();
// 	} else {
// 		workflow.on( 'uploader:ready', addFile );
// 	}
// }
/**
 *	MCE: Upload file and replace $placeholder with it
 */
const uploadPastedFile = ( file, $placeholder ) => {
	/*
	TODO:
	- check file extension against _wpPluploadSettings.defaults.filters.mime_types[0].extensions.split(',')
	*/
	const id = $placeholder.attr('id')
	const $body = $placeholder.closest('body')
	const thePaste = ThePaste.get(file)
	const progress = document.createElement('progress')
console.log(file)
	$placeholder.wrap( `<div data-id="${id}" class="thepaste-image-placeholder" contenteditable="false"></div>` )
	$placeholder.parent().append(progress)

	progress.max = 100

	thePaste.onUploaded = args => {

		let html
		const attachment = args.attachment.attributes
		if ( 'image' === attachment.type ) {
			html = wp.media.string.image( {}, attachment )
		} else if ( 'video' === attachment.type ) {
			html = wp.media.string.video( { link: 'embed' }, attachment )
		} else if ( 'audio' === attachment.type ) {
			html = wp.media.string.audio( { link: 'embed' }, attachment )
		} else {
			html = wp.media.string.link( {}, attachment )
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
		$body.find(`[data-id="${id}"]`).replaceWith( `<p>${html}</p>` )
		//*/
	}
	thePaste.onProgress = percent => {
		progress.value = percent
	}
	thePaste.onError = error => {
		Notices.error( `<strong>${thepaste.l10n.the_paste}:</strong> ${error.message} File: <em>${file.name}</em>`, true )
		$body.find(`[data-id="${id}"]`).remove()
	}
	thePaste.upload()
}

/**
 *	MCE: Generate data source image and replace $placeholder with it
 */
const processPastedImage = async ( file, element ) => {
	const fr = new FileReader()
	fr.addEventListener('load',() => { element.src = fr.result;} )
	fr.readAsDataURL(file)
	console.log(element)
	//
}

/**
 *	MCE: Upload data src image and insert into editor
 */
const uploadPastedDataImg = ( element, filename = '' ) => {
	uploadPastedFile(
		dataUrlToFile( element.src, filename ),
		$(element)
	)
}

const uploadPastedBlobImg = async element => {
	uploadPastedFile(
		await blobUrlToFile( element.src ),
		$(element)
	)
}
const convertPastedBlobImg = async element => {
	const blob = await blobUrlToFile( element.src )
	const fr = new FileReader()
	fr.addEventListener('load',() => element.src = fr.result )
	fr.readAsDataURL(blob)
}

module.exports = {
	uploadPastedFile,
	processPastedImage,
	uploadPastedDataImg,
	uploadPastedBlobImg,
	convertPastedBlobImg,
	dataUrlToFile
}
