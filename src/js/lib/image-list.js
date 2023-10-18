import Converter from 'converter'
import mime from 'mime'
import { supports } from 'compat'
import { generateFilename } from 'filename'

const ImageListItem = wp.media.View.extend({
	tagName:'form',
	template: wp.template('the-paste-image-list-item'),
	className: 'the-paste-image-list-item',
	events: {
		'click [name="discard"]': 'discard',
	},
	initialize : function( { file } ) {
		wp.media.View.prototype.initialize.apply( this, arguments );
		this.file = file
		new Promise( (resolve,reject) => {
			const rawImage = new Image();
			rawImage.addEventListener("load", function () {
				resolve(rawImage);
			});
			rawImage.src = Converter.fileToBlobUrl(file);
		})
		.then( rawImage => {
			let hasSize = rawImage.width && rawImage.height
			this.canvas = this.$('canvas').get(0)

			if ( 'image/svg+xml' === this.file.type ) {
				// append image to DOM to get actual size
				if ( hasSize ) {
					document.body.append(rawImage)
				} else {
					this.canvas.after(rawImage)
				}
			}
			// draw canvas
			this.canvas.width = rawImage.width;
			this.canvas.height = rawImage.height;
			this.canvas.getContext("2d").drawImage(rawImage, 0, 0);

			if ( 'image/svg+xml' === this.file.type ) {
				if ( hasSize ) {
					rawImage.remove()
				} else {
					// no known size: svg only
					this.$(`[data-format]:not([data-format="image/svg+xml"])`).remove()
				}
			}
		})
	},
	render: function() {
		wp.media.View.prototype.render.apply(this,arguments);

		const type     = this.file.type
		const basename = this.file.name.replace(/\.([^\.]*)$/,'')

		if ( ! supports.webp ) {
			if ( 'image/webp' !== type ) {
				this.$(`[data-format="image/webp"]`).remove()
			}
		}

		this.$(`[name="the-paste-format"][value="${type}"]`).prop('checked', true )
		this.$('[name="the-paste-filename"]').val( basename )
		this.$('[name="the-paste-filename"]').prop( 'placeholder', generateFilename() )

		if ( ! supports.svg || 'image/svg+xml' !== type ) {
			this.$(`[data-format="image/svg+xml"]`).remove()
			if ( 'image/svg+xml' === type ) {
				this.$(`[name="the-paste-format"][value="image/png"]`).prop('checked',true)
			}
		}
	},
	getFile: function() {
		const type = this.$('[name="the-paste-format"]:checked').val()
		const name = this.$('[name="the-paste-filename"]').val() || generateFilename()
		const filename = `${name}.${mime.extension(type)}`
		// upload as-is
		if ( this.file.type === type ) {
			return new Promise((resolve,reject) => {
				resolve( new File( [this.file], filename, { type } ) )
			})
		}
		// type conversion
		return new Promise((resolve,reject) => {
			this.canvas.toBlob( blob => {
				resolve( Converter.blobToFile( blob, filename ) )
			}, type, thepaste.options.jpeg_quality * 0.01 )
		})
	},
	discard: function() {
		this.controller.discardItem(this)
	}
})

const ImageList = wp.media.View.extend({
	template: wp.template('the-paste-image-list'),
	className: 'the-paste-image-list',
	events: {
		'click .media-frame-toolbar button': 'submit',
	},
	initialize : function( { files } ) {
		wp.media.View.prototype.initialize.apply( this, arguments );
		this.files = files
		this.items = []
		this.button = new wp.media.view.Button({
			className: 'button-primary button-hero',
		})
	},
	render: function() {
		wp.media.View.prototype.render.apply(this,arguments);
		this.files.forEach( file => {
			const item = new ImageListItem({file,controller:this})
			item.render()
			this.$('.content').append(item.$el)
			this.items.push( item )
			item.render()
		} )
	},
	discardItem:function(item) {
		this.files = this.files.filter( file => file !== item.file )
		this.items = this.items.filter( it => it !== item )
		item.$el.remove()
		if ( ! this.items.length ) {
			this.controller.close()
		}
	},
	getFiles: async function() {
		const files = []
		for ( const item of this.items ) {
			files.push( await item.getFile() )
		}
		return files
	},
	submit: function() {
		this.trigger('thepaste:submit')
	},
})


module.exports = ImageList
