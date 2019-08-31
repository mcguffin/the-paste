<?php
/**
 *	@package ThePaste\Admin
 *	@version 1.0.0
 *	2018-09-22
 */

namespace ThePaste\Admin;

if ( ! defined('ABSPATH') ) {
	die('FU!');
}

use ThePaste\Asset;
use ThePaste\Core;


class Admin extends Core\Singleton {

	private $core;

	private $mce;

	private $js;

	private $css;

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {

		$this->core = Core\Core::instance();
		$this->mce = TinyMce\TinyMceThePaste::instance();

		add_action( 'admin_init', array( $this , 'register_assets' ) );
		add_action( 'wp_enqueue_media', array( $this , 'enqueue_assets' ) );
		add_action( 'print_media_templates',  array( $this, 'print_media_templates' ) );
	}


	/**
	 *	Admin init
	 *	@action admin_init
	 */
	public function admin_init() {
	}

	/**
	 *	Enqueue options Assets
	 *	@action admin_print_scripts
	 */
	public function register_assets() {
		$this->css = Asset\Asset::get('css/admin/the-paste.css')->register();

		$this->js = Asset\Asset::get('js/admin/the-paste.js')
			->deps( array( 'jquery', 'media-editor' ) )
			->localize( array(
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
			), 'thepaste' )
			->register();
	}

	/**
	 *	Enqueue options Assets
	 *	@action admin_print_scripts
	 */
	public function enqueue_assets() {
		$this->css->enqueue();
		$this->js->enqueue();
	}

	/**
	 *	@action 'print_media_templates'
	 */
	function print_media_templates() {
	$rp = $this->core->get_plugin_dir() . '/include/template/{,*/,*/*/,*/*/*/}*.php';
		foreach ( glob( $rp, GLOB_BRACE ) as $template_file ) {
			include $template_file;
		}
	}
}
