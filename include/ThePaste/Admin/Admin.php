<?php

namespace ThePaste\Admin;

use ThePaste\Asset;
use ThePaste\Core;

class Admin extends Core\Singleton {

	/** @var TinyMce\TinyMce */
	private $mce;

	/** @var Asset\Asset */
	private $js;

	/** @var Asset\Asset */
	private $css;

	/** @var string */
	private $ajax_action_enable = 'the_paste_tinymce_enable';

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {

		if ( wp_is_mobile() ) {
			return;
		}

		// TinyMCE Advanced Plugin
		if ( $this->get_options()->tinymce_enabled ) {
			add_filter( 'tadv_allowed_buttons', function( $tadv_buttons ) {

				$tadv_buttons['thepaste_onoff'] = __( 'Paste as file', 'the-paste' );
				add_action( 'admin_footer', [ $this, 'print_media_templates' ] );

				return $tadv_buttons;
			});
		}

		add_action( 'admin_init', [ $this, 'register_assets' ] );
		add_action( 'wp_enqueue_media', [ $this, 'enqueue_assets' ] );
		add_action( 'print_media_templates',  [ $this, 'print_media_templates' ] );
		add_action( 'wp_enqueue_editor', [ $this, 'enqueue_assets' ] );
		add_action( "wp_ajax_{$this->ajax_action_enable}", [ $this, 'ajax_tinymce_enable' ] );

		// block editor
		// add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_assets' ] );

	}

	/**
	 *	@action wp_ajax_the_paste_tinymce_enable
	 */
	public function ajax_tinymce_enable() {

		check_ajax_referer( $this->ajax_action_enable );

		$enabled = isset( $_REQUEST['enabled'] )
			? (bool) wp_unslash( $_REQUEST['enabled'] )
			: false;

		$user = UserOptions::instance();
		$user->tinymce = $enabled;
		$user->save();

		wp_send_json( [ 'success' => true ] );
	}

	/**
	 *	Enqueue options Assets
	 *	@action admin_print_scripts
	 */
	public function register_assets() {

		$options = (object) $this->get_options();
		$user    = UserOptions::instance();

		if ( $options->tinymce_enabled ) {
			$this->mce = TinyMce\TinyMceThePaste::instance();
		}

		$current_user = wp_get_current_user();

		$this->css = Asset\Asset::get('css/admin/the-paste.css')->register();

		$this->js = Asset\Asset::get('js/admin/the-paste.js')
			->deps( [ 'jquery', 'media-editor' ] )
			->localize( [
				'l10n'    => [
					'upload_pasted_images' => __( 'Upload pasted images', 'the-paste' ),
					'upload_image'         => __( 'Upload image', 'the-paste' ),
					'the_paste'            => __( 'The Paste', 'plugin name', 'the-paste' ),
					'copy_paste'           => __( 'Copy & Paste', 'the-paste' ),
					'paste_files'          => __( 'Prefer pasting files', 'the-paste' ),
				],
				'options' => [
					'editor'           => [
						// 'auto_upload'       => true,
						'debugMode'         => false,
						'enabled'           => $user->tinymce,
						'enable_ajax_url'   => add_query_arg( [
							'action'      => $this->ajax_action_enable,
							'_ajax_nonce' => wp_create_nonce( $this->ajax_action_enable ),
						], admin_url( 'admin-ajax.php' ) ),
					],
					'mime_types'        => $this->get_mimetype_mapping(),
					'filename_values'   => [
						'username'  => $current_user->display_name,
						'userlogin' => $current_user->user_login,
						'userid'    => $current_user->ID,
					],
					'jpeg_quality'     => apply_filters( 'jpeg_quality', $options->image_quality, 'edit_image' ),
					/**
					 *	Filters the default filename
					 *
					 *	@param String $filename	The Filename. There are some placeholders:
					 *							Placeholders:
					 *								<postname> Name of current post
					 *								<username> Display name of current user
					 *								<userlogin> Login name of current user
					 *								<userid> Current user ID
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
					 *								%x Date based on locale
					 *								%X Time based on locale
					 */
					'default_filename' => apply_filters( 'the_paste_default_filename', $user->default_filename ),
				],
			], 'thepaste' )
			->register();
	}

	/**
	 *	@return AbstractOptions
	 */
	private function get_options() {
		if ( (bool) get_option( 'the_paste_enable_profile' ) ) {
			return UserOptions::instance()->options;
		} else {
			return WritingOptions::instance()->options;
		}
	}

	/**
	 *	Enqueue options Assets
	 *	@action admin_print_scripts
	 */
	public function enqueue_assets() {
		if ( current_user_can( 'upload_files' ) ) {
			if ( $this->css ) {
				$this->css->enqueue();
			}
			if ( $this->js ) {
				$this->js->enqueue();
			}
		}
	}

	/**
	 *	@action 'print_media_templates'
	 */
	public function print_media_templates() {
		if ( current_user_can( 'upload_files' ) ) {
			$rp = Core\Core::instance()->get_plugin_dir() . '/include/template/*.php';
			foreach ( glob( $rp ) as $template_file ) {
				include $template_file;
			}
		}
	}

	/**
	 *	@return array
	 */
	private function get_mimetype_mapping() {

		$mime_mapping = [];

		foreach( get_allowed_mime_types() as $extensions => $mime ) {
			foreach( explode( '|', $extensions ) as $extension ) {
				$mime_mapping[$extension] = $mime;
			}
		}
		uksort( $mime_mapping, function($a,$b) {
			// handle ambigous file extensions: put prefered suffix o front
			if ( in_array($a,['jpg','gz','tif','mov','mpeg','m4v','3gp','3g2','txt','html','m4a','ra','ogg','mid','ppt','xls'])) {
				return -1;
			}
			return 0;
		});
		return $mime_mapping;
	}
}
