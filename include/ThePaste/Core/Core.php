<?php

namespace ThePaste\Core;

if ( ! defined( 'ABSPATH' ) )
	die('Nope.');

class Core extends Singleton {


	/**
	 *	Private constructor
	 */
	protected function __construct() {
		add_action( 'plugins_loaded' , array( $this , 'load_textdomain' ) );
	}

	/**
	 *	Load text domain
	 * 
	 *  @action plugins_loaded
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'acf-quick-edit-fields' , false, THE_PASTE_DIRECTORY . '/languages/' );
	}

	/**
	 *	Get asset url for this plugin
	 *
	 *	@param	string	$asset	URL part relative to plugin dir
	 *	@return string
	 */
	public function get_asset_url( $asset ) {
		return plugins_url( ltrim( $asset, '/' ), trailingslashit( THE_PASTE_FILE ) );
	}

	/**
	 *	Get asset path for this plugin
	 *
	 *	@param	string	$asset	URL part relative to plugin dir
	 *	@return string
	 */
	public function get_asset_path( $asset ) {
		return THE_PASTE_DIRECTORY . ltrim( $asset, '/' );
	}

}
