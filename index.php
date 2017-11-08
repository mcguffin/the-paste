<?php

/*
Plugin Name: The Paste
Plugin URI: https://wordpress.org/plugins/the-paste/
Description: Paste Images in WordPress from many applications md upload them to the media library.
Author: Jörn Lund
Version: 1.0.2
Author URI: https://github.com/mcguffin/
License: GPL2
Text Domain: the-paste
Domain Path: /languages
*/


namespace ThePaste;

define( 'THE_PASTE_FILE', __FILE__ );
define( 'THE_PASTE_VERSION', '1.0.2' );
define( 'THE_PASTE_DIRECTORY', plugin_dir_path(__FILE__) );



require_once THE_PASTE_DIRECTORY . 'include/vendor/autoload.php';

Core\Core::instance();

if ( is_admin() || defined( 'DOING_AJAX' ) ) {

	Admin\Admin::instance();

}
