<?php
/**
 *	@package ThePaste\Core
 *	@version 1.0.1
 *	2018-09-22
 */

namespace ThePaste\Core;

if ( ! defined('ABSPATH') ) {
	die('FU!');
}
use ThePaste\Asset;

class Core extends Plugin implements CoreInterface {

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {

		add_action( 'init' , array( $this , 'init' ) );

		add_action( 'wp_enqueue_scripts' , array( $this , 'enqueue_assets' ) );

		$args = func_get_args();
		parent::__construct( ...$args );
	}

	/**
	 *	Load frontend styles and scripts
	 *
	 *	@action wp_enqueue_scripts
	 */
	public function enqueue_assets() {
	}




	/**
	 *	Init hook.
	 *
	 *  @action init
	 */
	public function init() {
	}


}
