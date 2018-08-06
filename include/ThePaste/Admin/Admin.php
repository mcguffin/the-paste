<?php

namespace ThePaste\Admin;
use ThePaste\Core;


class Admin extends Core\Singleton {

	private $core;

	/**
	 *	Private constructor
	 */
	protected function __construct() {

		$this->core = Core\Core::instance();

		$this->mce = TinyMce\TinyMceThePaste::instance();

		add_action( 'admin_init' , array( $this, 'admin_init' ) );
		add_action( 'wp_enqueue_media' , array( $this, 'wp_enqueue_media' ) );
		add_action( 'print_media_templates',  array( $this, 'print_media_templates' ) );
	}

	/**
	 *	register scripts
	 *
	 *	@action admin_init
	 */
	function admin_init() {

		$version = THE_PASTE_VERSION;

		if ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) {
			$script_source = 'js/admin/the-paste.min.js';
		} else {
			$script_source = 'js/admin/the-paste.js';
		}

		wp_register_script( 'the-paste-base',
			$this->core->get_asset_url( $script_source ),
			array( 'jquery', 'media-editor' ),
			$version
		);
		wp_localize_script( 'the-paste-base' , 'thepaste' , array(
			'l10n' => array(
				'snapshot' 						=> __( 'Snapshot','the-paste' ),
				'take_snapshot' 				=> __( 'Take Snapshot','the-paste' ),
				'copy_paste' 					=> __( 'Copy & Paste', 'the-paste' ),
				'pasted' 						=> __( 'Pasted', 'the-paste' ),
				'pasted_into'					=> __( 'Pasted into', 'the-paste' ),
				'image' 						=> __( 'Image', 'the-paste' ),
				'paste_error_no_image' 			=> __( 'No image data pasted.', 'the-paste' ),
				'paste_error'					=> __( 'Error pasting image data.', 'the-paste' ),
				'upload_pasted_images'			=> __( 'Upload pasted images', 'the-paste' ),
				'upload_image'					=> __( 'Upload image', 'the-paste' ),

			),
			'options'	=> array(
				'mime_types'	=> array(
					'convert' => array(
						'image/jpeg'		=> 'jpg',
						'image/png'			=> 'png',
					),
					'paste' => array(
						'image/jpeg'		=> 'jpg',
						'image/png'			=> 'png',
						'image/tiff'		=> 'tif',
						'image/pict'		=> 'pict',
//						'application/pdf'	=> 'pdf',
					),
				),
				'editor'		=> array(
					'auto_upload'		=> true,
					'force_upload_size'	=> apply_filters('the_paste_max_embed_imge_size', 512 * 512 ),
				),
				'jpeg_quality'					=> apply_filters( 'jpeg_quality', 90, 'edit_image' ),
			),
		) );

		wp_register_style( 'the-paste' , $this->core->get_asset_url( 'css/admin/the-paste.css' ) , array( ) , $version );
	}

	/**
	 *	Enqueue the-paste scripts along with wp media
	 *
	 *	@action wp_enqueue_media
	 */
	function wp_enqueue_media() {
		if ( ! did_action('wp_enqueue_media') ) {
			wp_enqueue_media();
		}
		wp_enqueue_script( 'the-paste-base');
		wp_enqueue_style( 'the-paste' );
		do_action('the_paste_enqueue_script' );
	}

	/**
	 *	@action 'print_media_templates'
	 */
	function print_media_templates() {
		$rp = THE_PASTE_DIRECTORY . 'include' . DIRECTORY_SEPARATOR . '/template/{,*/,*/*/,*/*/*/}*.php';
		foreach ( glob( $rp, GLOB_BRACE ) as $template_file ) {
			include $template_file;
		}
	}
}
