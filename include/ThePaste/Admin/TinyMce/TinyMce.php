<?php

namespace ThePaste\Admin\TinyMce;

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
	 *	Load custom css for toolbar.
	 *	boolean
	 */
	protected $text_widget = false;

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


	/**
	 * Private constructor
	 */
	protected function __construct() {

		$this->core = Core\Core::instance();

		if ( is_null( $this->module_name ) ) {
			throw( new Exception( '`$module_name` must be defined in a derived classes.' ) );
		}

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

		if ( $this->text_widget !== false ) {
			// looks like it will only works with widget?
			add_action( 'print_default_editor_scripts', array( $this, 'print_editor_scripts' ) );
			if ( $this->toolbar_css ) {
				add_action( 'load-widgets.php', array( $this,'enqueue_toolbar_css' ) );
			}
		}
		// will only work with default editor
		add_filter( 'mce_external_plugins', array( $this, 'add_plugin' ) );

		parent::__construct();

	}

	/**
	 *	@action print_default_editor_scripts
	 */
	public function print_editor_scripts() {

		$suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';

		$js_settings = array() + $this->mce_settings;

		// add editor css
		if ( $this->editor_css ) {
			$js_settings = wp_parse_args( $js_settings, array(
				'content_css'	=> $this->get_mce_css_url(),
			) );
		}

		// add buttons
		foreach ( $this->editor_buttons as $row => $btns ) {

			$toolbar_idx = preg_replace('/([^0-9]+)/imsU','', $row );

			if ( ! $btns ) {
				continue;
			}

			$js_settings[ 'toolbar' . $toolbar_idx ] = implode( ',', array_keys($btns) );
		}

		// add plugin
		$js_settings['external_plugins'] = $this->add_plugin( array() );

		?>
<script type="text/javascript">
/* TinyMCE plugin <?php echo $this->module_name ?> */
// extend wp editor settings
(function($){
	var orig = window.wp.editor.getDefaultSettings;
	window.wp.editor.getDefaultSettings = function() {
		var settings = orig.apply( this, arguments ),
			mergeSettings = <?php echo json_encode( $js_settings ); ?>;
		$.each( mergeSettings, function(i,el) {
			var type,
				override = ['entity_encoding', 'language', 'resize', 'skin', 'theme','wp_lang_attr'];
			if ( ! ( i in settings.tinymce ) || (i in override) || 'booelan' === typeof settings.tinymce[i] ) {
				settings.tinymce[i] = el;
			} else {
				type = typeof settings.tinymce[i];
				if ( 'string' === type ) {
					settings.tinymce[i] += ',' + el;
				} else if ( 'object' === type ) {
					settings.tinymce[i] = $.extend( true, settings.tinymce[i], el );
				}
			}
		});
		return settings;
	}
})(jQuery);
/* END: TinyMCE plugin <?php echo $this->module_name ?> */

</script>
		<?php
	}

	/**
	 *	Add MCE plugin
	 *
	 *	@filter mce_external_plugins
	 */
	public function add_plugin( $plugins_array ) {
		$suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';
		$plugins_array[ $this->prefix ] = $this->core->get_asset_url( $this->script_dir . '/admin/mce/'.$this->module_name.'-plugin'.$suffix.'.js' );
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
		$suffix = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '' : '.min';
		$asset_id = sprintf( 'tinymce-%s-toolbar-css', $this->module_name );
		wp_enqueue_style( $asset_id, $this->get_toolbar_css_url() );
	}

	/**
	 *	@return string URL to editor css
	 */
	 protected function get_toolbar_css_url() {
 		return $this->core->get_asset_url( $this->styles_dir . '/admin/mce/'. $this->module_name.'-toolbar.css' );
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
		return $this->core->get_asset_url( $this->styles_dir . '/admin/mce/'. $this->module_name.'-editor.css' );
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
	 *	Get asset url for this editor plugin
	 *
	 *	@param	string	$asset	URL part relative to theme root
	 *	@return string	url
	 */
	protected function get_asset_url( $asset ) {
		return $this->core->get_asset_url( $this->asset_dir_uri . ltrim( $asset, '/' ) );
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
