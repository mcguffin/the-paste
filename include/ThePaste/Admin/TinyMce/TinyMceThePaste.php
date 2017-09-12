<?php

namespace ThePaste\Admin\TinyMce;

class TinyMceThePaste extends TinyMce {

	protected $module_name = 'the-paste';

	protected $editor_buttons = array(
		'mce_buttons_2'	=> array(
			'thepaste'	=> 3000,
		),
	);

	protected $toolbar_css = true;
	protected $editor_css = true;
	protected $text_widget = true;

	/**
	 * Private constructor
	 */
	protected function __construct() {
		$this->plugin_params = array();
		$this->mce_settings =  array(
			'extended_valid_elements' => 'canvas',
			'custom_elements' => 'canvas',
		);
		parent::__construct();
	}
}
