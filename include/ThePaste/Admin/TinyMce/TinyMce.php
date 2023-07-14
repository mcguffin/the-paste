<?php

namespace ThePaste\Admin\TinyMce;

use ThePaste\Asset;
use ThePaste\Core;


abstract class TinyMce extends Core\Singleton {

	/**
	 *	Module name
	 *	lowercase string.
	 *	You *must* override this in a derived class
	 */
	protected $module_name = null;

	/**
	 *	Override to add buttons
	 *
	 *	Usage:
	 *	protected $editor_buttons = array(
	 *		'mce_buttons'	=> array(
	 *			'append_button'	=> false,
	 *			'insert_button_at_position'	=> 3,
	 *		),
	 *		'mce_buttons_2'	=> array(
	 *			'append_button_to_second_row'	=> false,
	 *		),
	 *	);
	 */
	protected $editor_buttons = array();

	/**
	 *	Plugin params
	 *	An arbitrary array which will be made avaialable in JS
	 *	under the varname mce_{$module_name}.
	 *
	 */
	protected $plugin_params = false;

	/**
	 *	TinyMCE Settings
	 */
	protected $mce_settings = false;

	/**
	 *	Load custom css for toolbar.
	 *	boolean
	 */
	protected $toolbar_css = false;

	/**
	 *	Load custom css for editor.
	 *	boolean
	 */
	protected $editor_css = false;

	/**
	 *	Asset dir for derived class
	 *	string path
	 */
	private $asset_dir_uri = null;

	/**
	 *	Asset dir for derived class
	 *	string path
	 */
	private $asset_dir_path = null;

	/**
	 *	Asset dir for derived class
	 *	string path
	 */
	private $theme = null;

	protected $script_dir = 'js';
	protected $styles_dir = 'css';

	private $plugin_js;
	private $prefix;

	/**
	 * Private constructor
	 */
	protected function __construct() {

		if ( is_null( $this->module_name ) ) {
			throw( new Exception( '`$module_name` must be defined in a derived classes.' ) );
		}

		$this->plugin_js = Asset\Asset::get( 'js/admin/mce/' . $this->module_name . '-plugin.js' );
		$this->editor_css = Asset\Asset::get( 'css/admin/mce/' . $this->module_name . '-editor.css' );
		$this->toolbar_css = Asset\Asset::get( 'css/admin/mce/' . $this->module_name . '-toolbar.css' );

		$this->prefix = str_replace( '-', '_', $this->module_name );

		$parts = array_slice( explode( '\\', get_class( $this ) ), 0, -1 );
		array_unshift( $parts, 'include' );

		$this->asset_dir_uri = trailingslashit( implode( DIRECTORY_SEPARATOR, $parts ) );

		$this->asset_dir_path = trailingslashit( implode( DIRECTORY_SEPARATOR, $parts ) );

		// add tinymce buttons
		$this->editor_buttons = wp_parse_args( $this->editor_buttons, array(
			'mce_buttons'	=> false,
			'mce_buttons_2'	=> false,
		) );

		foreach ( $this->editor_buttons as $hook => $buttons ) {
			if ( $buttons !== false ) {
				add_filter( $hook, array( $this, 'add_buttons' ) );
			}
		}


		// add tinymce plugin parameters
		if ( $this->plugin_params !== false ) {
			add_action( 'wp_enqueue_editor' , array( $this , 'action_enqueue_editor' ) );
		}
		if ( $this->mce_settings !== false ) {
			add_action( 'tiny_mce_before_init' , array( $this , 'tiny_mce_before_init' ) );
		}

		if ( $this->editor_css !== false ) {
			add_filter('mce_css' , array( $this , 'mce_css' ) );
		}
		if ( $this->toolbar_css !== false ) {
			add_action( "admin_print_scripts", array( $this, 'enqueue_toolbar_css') );
		}

		// will only work with default editor
		add_filter( 'mce_external_plugins', array( $this, 'add_plugin' ) );

		parent::__construct();

	}

	/**
	 *	Add MCE plugin
	 *
	 *	@filter mce_external_plugins
	 */
	public function add_plugin( $plugins_array ) {

		$plugins_array[ $this->prefix ] = $this->plugin_js->url;
		return $plugins_array;
	}

	/**
	 *	Add toolbar Buttons.
	 *
	 *	@filter mce_buttons, mce_buttons_2
	 */
	public function add_buttons( $buttons ) {
		$hook = current_filter();
		if ( isset( $this->editor_buttons[ $hook ] ) && is_array( $this->editor_buttons[ $hook ] ) ) {
			foreach ( $this->editor_buttons[ $hook ] as $button => $position ) {
				if ( $position === false ) {
					$buttons[] = $button;
				} else {
					array_splice( $buttons, $position, 0, $button );
				}
			}
		}
		return $buttons;
	}


	/**
	 *	Enqueue toolbar css
	 *
	 *	@action admin_print_scripts
	 */
	public function enqueue_toolbar_css() {
		$asset_id = sprintf( 'tinymce-%s-toolbar-css', $this->module_name );
		wp_enqueue_style( $asset_id, $this->get_toolbar_css_url() );
	}

	/**
	 *	@return string URL to editor css
	 */
	 protected function get_toolbar_css_url() {
 		return $this->toolbar_css->url;
 	}

	/**
	 *	Add editor css
	 *
	 *	@filter mce_css
	 */
	public function mce_css( $styles ) {
		$styles .= ','. $this->get_mce_css_url();
		return $styles;
	}

	/**
	 *	@return string URL to editor css
	 */
	protected function get_mce_css_url() {
		return $this->editor_css->url;//
	}
	/**
	 *	print plugin settings
	 *
	 *	@action wp_enqueue_editor
	 */
	public function tiny_mce_before_init( $settings ) {
    	return $this->mce_settings + $settings;
	}

	/**
	 *	print plugin settings
	 *
	 *	@action wp_enqueue_editor
	 */
	public function action_enqueue_editor( $to_load ) {
		if ( $to_load['tinymce'] ) {
			add_action( 'admin_footer' , array( $this , 'mce_localize' ) );
		}
	}
	/**
	 *	print plugin settings
	 *
	 *	@action admin_footer
	 */
	public function mce_localize( $to_load ) {
		$varname = sprintf( 'mce_%s', $this->prefix );
		$params = json_encode($this->plugin_params );
		printf( '<script type="text/javascript"> var %s = %s;</script>', $varname, $params );
	}

	/**
	 *	Get asset path for this editor plugin
	 *
	 *	@param	string	$asset	Dir part relative to theme root
	 *	@return path
	 */
	protected function getAssetPath( $asset ) {
		return $this->theme->getAssetPath( $this->asset_dir_path . ltrim( $asset, '/' )  );
	}

}
