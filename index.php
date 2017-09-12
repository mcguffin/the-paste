<?php

/*
Plugin Name: The Paste
Plugin URI: https://github.com/mcguffin/the-paste/
Description: Paste images in WordPress
Author: Jörn Lund
Version: 0.0.1
Author URI: https://github.com/mcguffin/
License: GPL2
*/


namespace ThePaste;

define( 'THE_PASTE_FILE', __FILE__ );
define( 'THE_PASTE_VERSION', '0.0.1' );
define( 'THE_PASTE_DIRECTORY', plugin_dir_path(__FILE__) );



require_once THE_PASTE_DIRECTORY . 'include/vendor/autoload.php';

Core\Core::instance();

if ( is_admin() || defined( 'DOING_AJAX' ) ) {

	Admin\Admin::instance();
	Settings\SettingsMedia::instance();

}
