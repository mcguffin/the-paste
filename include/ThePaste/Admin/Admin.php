<?php
/**
 *	@package ThePaste\Admin
 *	@version 1.0.0
 *	2018-09-22
 */

namespace ThePaste\Admin;

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

		if ( wp_is_mobile() ) {
			return;
		}

		add_action( 'admin_init', [ $this, 'register_assets' ] );
		add_action( 'wp_enqueue_media', [ $this, 'enqueue_assets' ] );
		add_action( 'print_media_templates',  [ $this, 'print_media_templates' ] );
	}

	/**
	 *	Enqueue options Assets
	 *	@action admin_print_scripts
	 */
	public function register_assets() {
		$user = User::instance();
		if ( $user->tinymce ) {
			$this->mce = TinyMce\TinyMceThePaste::instance();
		}

		$this->css = Asset\Asset::get('css/admin/the-paste.css')->register();

		$this->js = Asset\Asset::get('js/admin/the-paste.js')
			->deps( [ 'jquery', 'media-editor' ] )
			->localize( [
				'l10n'    => [
					'upload_pasted_images' => __( 'Upload pasted images', 'the-paste' ),
					'upload_image'         => __( 'Upload image', 'the-paste' ),
					'the_paste'            => __( 'The Paste', 'plugin name', 'the-paste' ),
					'copy_paste'           => __( 'Copy & Paste', 'the-paste' ),
				],
				'options' => [
					'editor'           => [
						'auto_upload'       => true,
						/**
						 *	Size limit for data uri images
						 *
						 *	@param Int $size	Max image size in pixels (width * height) being pasted as data url
						 */
						'force_upload_size' => apply_filters('the_paste_max_embed_image_size',
							apply_filters('the_paste_max_embed_imge_size', 512 * 512 ) // backwards compatibility
						),
					],
					'jpeg_quality'     => apply_filters( 'jpeg_quality', 90, 'edit_image' ),
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
					'default_filename' => apply_filters( 'the_paste_default_filename', $user->default_filename ),
				],
			], 'thepaste' )
			->register();
	}

	/**
	 *	Enqueue options Assets
	 *	@action admin_print_scripts
	 */
	public function enqueue_assets() {
		if ( current_user_can( 'upload_files' ) ) {
			$this->css->enqueue();
			$this->js->enqueue();
		}
	}

	/**
	 *	@action 'print_media_templates'
	 */
	function print_media_templates() {
		if ( current_user_can( 'upload_files' ) ) {
			$rp = Core\Core::instance()->get_plugin_dir() . '/include/template/{,*/,*/*/,*/*/*/}*.php';
			foreach ( glob( $rp, GLOB_BRACE ) as $template_file ) {
				include $template_file;
			}
		}
	}
}
