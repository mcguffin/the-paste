<?php

namespace ThePaste\Settings;
use ThePaste\Core;

abstract class Settings extends Core\Singleton {

	protected $optionset;

	/**
	 *	Constructor
	 */
	protected function __construct(){

		add_action( 'admin_init' , array( $this, 'register_settings' ) );

		parent::__construct();

	}


	abstract function register_settings();

	public function getOptionset() {
		return $this->optionset;
	}
	/**
	 *	Print a checkbox
	 *
	 *	@param $args	array( $option_name, $label )
	 */
	public function checkbox_ui( $args ) {
		@list( $option_name, $label, $description ) = array_values( $args );
		
		$option_value = get_option( $option_name );
		
		?><label>
			<input type="hidden" name="<?php echo $option_name ?>" value="0" />
			<input type="checkbox" <?php checked( boolval( $option_value ), true, true ); ?> name="<?php echo $option_name ?>" value="1" />
			<?php echo $label ?>
		</label>
		<?php 
			if ( ! empty( $description ) ) {
				printf( '<p class="description">%s</p>', $description );
			}
		?>
		<?php

	}

	/**
	 *	Sanitize checkbox input
	 *
	 *	@param $value
	 *	@return boolean
	 */
	public function sanitize_checkbox( $value ) {
		return boolval( $value );
	}

}