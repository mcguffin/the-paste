<?php

namespace ThePaste\Settings;
use ThePaste\Core;

class SettingsMedia extends Settings {

	protected $optionset = 'media'; 


	/**
	 *	Constructor
	 */
	protected function __construct() {

		parent::__construct();

	}



	/**
	 *	Setup options.
	 *
	 *	@action admin_init
	 */
	public function register_settings() {
		$settings_section = 'thepaste_settings';
		// more settings go here ...

		add_settings_section( $settings_section, __( 'Pasted Images',  'the-paste' ), array( &$this, 'settings_description' ), $this->optionset );

		// ... and here
		do_action( 'the_paste_register_settings', $this, $settings_section );

		return;
		/*
		[x] Option upload pasted images to media library.
		*/

		$option_name = 'thepaste_enable_pasteboard';
		register_setting( $this->optionset, $option_name , 'boolval' );
		add_settings_field(
			$option_name,
			__( 'Pasteboard',  'the-paste' ),
			array( $this, 'checkbox' ),
			$this->optionset,
			$settings_section,
			array(
				'option_name'	=> $option_name,
				'option_label'	=> __('Enable Copy-Paste image uploads.','the-paste'),
			)
		);

	}

	/**
	 *	Print some documentation for the optionset
	 *
	 *	@usedby register_settings
	 */
	public function settings_description() {
	}

	/**
	 *	Output checkbox
	 *
	 *	@usedby register_settings
	 */
	public function checkbox( $args ){
		$setting = get_option( $args['option_name'] );
		?><label><?php
			?><input type="checkbox" name="<?php echo $args['option_name'] ?>" <?php checked( $setting,true,true ) ?> value="1" /><?php
			echo $args['option_label']
		?></label><?php
		if ( isset($args['option_description']) ) {
			?><p class="description"><?php
				echo $args['option_description']
			?></p><?php
		}
	}


}