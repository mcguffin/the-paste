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
					'too_big_to_paste'				=> __( 'Sorry, this image is too big to pasted.', 'the-paste' ),
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
						'can_upload'		=> current_user_can( 'upload_files' ),
						'auto_upload'		=> true,
						/**
						 *	Filters the default filename
						 *
						 *	@param Int $size	Max image size in pixels (width * height) being pasted as data url
						 */
						'force_upload_size'	=> apply_filters('the_paste_max_embed_image_size',
							apply_filters('the_paste_max_embed_imge_size', 512 * 512 ) // backwards compatibility
						),
					),
					'jpeg_quality'					=> apply_filters( 'jpeg_quality', 90, 'edit_image' ),
					/**
					 *	Filters the default filename
					 *
					 *	@param String $filename	The Filename. There are some placeholders:
					 *							Placeholders:
					 *								<postname> Name of current post
					 *								<username> Name of current user
					 *							Date and Time placeholders (a subset of php's strftime() format characters):
					 *								%Y Four-digit year
					 *								%y Two-digit year
					 *								%m Number of month with leading zero (01 to 12)
					 *								%d Day of month with leading zero (01 to 31)
					 *								%e Day of month (1 to 31)
					 *								%H Two digit hour in 24-hour format
					 *								%I Two digit hour in 12-hour format
					 *								%M Two digit minute
					 *								%S Two digit second
					 *								%s Unix timestamp
					 */
					'default_filename'				=> apply_filters( 'the_paste_default_filename', __( 'Pasted', 'the-paste' ) ),
				),
			), 'thepaste' )
			->register();
	}

	/**
	 *	Enqueue options Assets
	 *	@action admin_print_scripts
	 */
	public function enqueue_assets() {
        if ($this && $this->css) {
            $this->css->enqueue();
        }
        if ($this && $this->js) {
            $this->js->enqueue();
        }
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
