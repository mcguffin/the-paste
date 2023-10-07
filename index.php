<?php

/*
Plugin Name: The Paste
Plugin URI: https://wordpress.org/plugins/the-paste/
Description: Paste files and image data from clipboard into the WordPress media library.
Author: Jörn Lund
Version: 2.0.7
Author URI: https://github.com/mcguffin
License: GPL3
Requires WP: 4.8
Requires PHP: 7.4
Text Domain: the-paste
Domain Path: /languages
*/

/*  Copyright 2019-2023 Jörn Lund

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/


namespace ThePaste;

if ( ! defined('ABSPATH') ) {
	die('FU!');
}

require_once __DIR__ . DIRECTORY_SEPARATOR . 'include/autoload.php';

Core\Core::instance( __FILE__ );

if ( is_admin() || defined( 'DOING_AJAX' ) ) {
	add_action( 'init', function() {
		Admin\Admin::instance();
		Admin\User::instance();
	});
}
