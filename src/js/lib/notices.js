import $ from 'jquery'

class Notices {

	static #dismissButton = `<button type="button" class="notice-dismiss"><span class="screen-reader-text">${wp.i18n.__( 'Dismiss this notice.' )}</span></button>`;

	static success( message, dismissible = false ) {
		Notices.#addNotice( 'updated', message, dismissible )
	}

	static notify( message, dismissible = false ) {
		Notices.#addNotice( '', message, dismissible )
	}

	static warn( message, dismissible = false ) {
		Notices.#addNotice( 'notice-warning', message, dismissible )
	}

	static error( message, dismissible = false ) {
		Notices.#addNotice( 'error', message, dismissible )
	}

	static #addNotice( type, message, dismissible = false ) {
		const classes = `${type} notice ${dismissible?'is-dismissible':''}`.trim()
		const html = `<div class="${classes}"><p>${message}</p></div>`;
		const $headerEnd = $( '.wp-header-end' ).first();
		console.log($headerEnd)
		$(html).insertAfter( $headerEnd );
		$(document).trigger( 'wp-updates-notice-added' );
	}
}

module.exports = Notices
