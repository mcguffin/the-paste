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
	protected $editor_buttons = [
		'mce_buttons_2'	=> [
			'thepaste'	=> 3000,
		],
	];

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
	protected function __construct() {
		$this->plugin_params = [];
		$this->mce_settings = [
			'paste_data_images' => false, //
		];
		parent::__construct();
	}
}
