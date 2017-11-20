<?php

// this is pro now
namespace ThePaste;
use ThePaste\Core;

class ThePastePro extends Core\Singleton {
	/**
	 *	@inheritdoc
	 */
	protected function __construct() {
		add_action('the_paste_enqueue_script',array($this,'enqueue_script'));
	}

	/**
	 *	@action the_paste_enqueue_script
	 */
	public function enqueue_script() {
		wp_enqueue_script();
	}
}
