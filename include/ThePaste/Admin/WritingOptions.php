<?php
/**
 *	@package ThePaste\Admin\Settings
 *	@version 1.0.0
 *	2018-09-22
 */

namespace ThePaste\Admin;

if ( ! defined('ABSPATH') ) {
	die('FU!');
}

use ThePaste\Asset;
use ThePaste\Core;

class WritingOptions extends AbstractOptions {

	private $optionset = 'writing';

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {

		parent::__construct();

		add_action( 'admin_init', [ $this, 'register_settings' ] );

		add_option( 'the_paste_enable_profile', '1', '', true );

		$this->load();

		parent::__construct();

	}

	/**
	 *	@inheritdoc
	 */
	public function load() {
		$this->_options = get_option( $this->option_name, $this->defaults );

		if ( ! is_array( $this->_options ) ) {
			$this->_options = [];
		}
		$this->_options = wp_parse_args( $this->_options, $this->defaults );
	}

	/**
	 *	@inheritdoc
	 */
	public function save() {
		update_option( $this->option_name, (array) $this->options );
	}

	/**
	 *	Setup options.
	 *
	 *	@action admin_init
	 */
	public function register_settings() {

		$settings_section = 'the_paste_writing_settings';

		add_settings_section( $settings_section, __( 'The Paste', 'the-paste' ), null, $this->optionset );


		register_setting( $this->optionset, $this->option_name, [ $this, 'sanitize' ] );
		add_settings_field(
			$this->option_name,
			__( 'Classic Editor', 'the-paste' ),
			[ $this, 'tinymce_ui' ],
			$this->optionset,
			$settings_section,
			[]
		);
		add_settings_field(
			$this->option_name.'_quality',
			__( 'Image Quality', 'the-paste' ),
			[ $this, 'quality_ui' ],
			$this->optionset,
			$settings_section,
			[]
		);
		add_settings_field(
			$this->option_name.'_filename',
			__( 'Default filename', 'the-paste' ),
			[ $this, 'filename_ui' ],
			$this->optionset,
			$settings_section,
			[]
		);

		$option_name      = 'the_paste_enable_profile';
		register_setting( $this->optionset, $option_name, 'boolval' );
		add_settings_field(
			$option_name,
			__( 'User profile options', 'the-paste' ),
			[ $this, 'checkbox_ui' ],
			$this->optionset,
			$settings_section,
			[
				'option_name'        => $option_name,
				'option_value'       => (bool) get_option( $option_name ),
				'option_label'       => __( 'Allow users to manage their personal pasting options', 'the-paste' )
			]
		);

		add_settings_field(
			$this->option_name.'_donate',
			__( 'Support The Paste', 'the-paste' ),
			[ $this, 'donate_ui' ],
			$this->optionset,
			$settings_section,
			[]
		);
	}
}
