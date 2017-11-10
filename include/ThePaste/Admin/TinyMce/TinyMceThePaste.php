<?php

namespace ThePaste\Admin\TinyMce;

class TinyMceThePaste extends TinyMce {

	/**
	 *	@inheritdoc
	 */
	protected $module_name = 'the-paste';

	/**
	 *	@inheritdoc
	 */
	protected $editor_buttons = array(
		'mce_buttons_2'	=> array(
			'thepaste'	=> 3000,
		),
	);

	/**
	 *	@inheritdoc
	 */
	protected $toolbar_css = true;

	/**
	 *	@inheritdoc
	 */
	protected $editor_css = true;

	/**
	 *	@inheritdoc
	 */
	protected $text_widget = true;

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {
		$this->plugin_params = array();
		$this->mce_settings =  array(
			'paste_data_images'			=> true,
		);
		parent::__construct();
	}
}
