import Converter from 'converter'
import mime from 'mime-types'

const supportsWebp = (() => document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0)();

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
			this.canvas = this.$('canvas').get(0)
			const ctx = this.canvas.getContext("2d");
			this.canvas.width = rawImage.width;
			this.canvas.height = rawImage.height;
			ctx.drawImage(rawImage, 0, 0);
		})
	},
	render: function() {
		wp.media.View.prototype.render.apply(this,arguments);
		const [ filename, basename, suffix ] = /(.*)\.([^.]+)$/.exec( this.file.name )
		const type = mime.lookup(suffix)
		if ( ! supportsWebp ) {
			if ( 'image/webp' !== type ) {
				this.$(`[data-format="image/webp"]`).remove()
			}
		}
		this.$(`[name="the-paste-format"][value="${type}"]`).prop('checked', true )
		this.$('[name="the-paste-filename"]').val( basename )
	},
	getFile: function() {
		const type = this.$('[name="the-paste-format"]:checked').val()
		const name = this.$('[name="the-paste-filename"]').val()
		const filename = `${name}.${mime.extension(type)}`
		if ( this.file.type === type ) {
			this.file.name = name
			return new Promise((resolve,reject) => {
				console.log(this.file,type)
				resolve( this.file )
			})
		}
		return new Promise((resolve,reject) => {
			this.canvas.toBlob( blob => {
				resolve( Converter.blobToFile( blob, filename ) )
			}, type )
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
		files.forEach( f=> console.log(f))
		return files
	},
	submit: function() {
		this.trigger('thepaste:submit')
	},
})


module.exports = ImageList
