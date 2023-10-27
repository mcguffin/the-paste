<?php
/**
 *	@package ThePaste\Admin
 *	@version 1.0.0
 *	2018-09-22
 */

namespace ThePaste\Admin;

use ThePaste\Core;

abstract class AbstractOptions extends Core\Singleton {

	protected $option_name = 'the_paste';

	/** @var array */
	protected $defaults = [
		'tinymce_enabled'  => true,
		'tinymce'          => true, // paste file data
		'image_quality'    => 90,
		'default_filename' => '',
	];

	protected $_options = [];

	/**
	 *	Load options from DB
	 */
	abstract public function load();

	/**
	 *	Save options to DB
	 */
	abstract public function save();

	/**
	 *	Getter
	 *
	 *	@param string $what
	 */
	public function __get( $what ) {

		if ( isset( $this->defaults[$what] ) ) {
			$opt = wp_parse_args( $this->_options, $this->defaults );
			return $opt[$what];
		} else if ( 'options' === $what ) {
			return (object) $this->_options;
		}
	}

	/**
	 *	Getter
	 *
	 *	@param string $what
	 *	@param mixed $value
	 */
	public function __set( $what, $value ) {

		if ( isset( $this->defaults[$what] ) ) {
			if ( in_array( $what, [ 'tinymce_enabled', 'tinymce' ] ) ) { // boolean options
				$this->_options[$what] = (boolean) $value;

			} else if ( in_array( $what, [ 'image_quality' ] ) ) { // boolean options
				$this->_options[$what] = absint( $value );

			} else if ( in_array( $what, ['default_filename'] ) ) { // filename template
				$this->_options[$what] = strip_tags(trim( $value ), [ '<postname>', '<username>', '<userlogin>', '<userid>' ] );
			}
		}
	}

	/**
	 *	@param array
	 */
	public function sanitize( $options ) {
		if ( ! is_array( $options ) ) {
			return false;
		}
		foreach ( $options as $opt => $value ) {
			$this->$opt = $value;
		}
		return (array) $this->options;
	}

	/**
	 *	@param array $args [
	 *		'option_name'        => string
	 *		'option_value'       => mixed
	 *		'option_label'       => string
	 *		'option_description' => string
	 *	]
	 */
	public function checkbox_ui( $args ) {
		/**
		 */
		?><label>
			<input type="hidden" name="<?php echo esc_attr( $args['option_name'] ) ?>" value="0" />
			<input type="checkbox" <?php checked( boolval( $args['option_value'] ), true, true ); ?> name="<?php echo esc_attr( $args['option_name'] ) ?>" value="1" />
			<?php echo esc_html( $args['option_label'] ) ?>
		</label>
		<?php
			if ( ! empty( $args['option_description'] ) ) {
				printf( '<p class="description">%s</p>', esc_html( $args['option_description'] ) );
			}
		?>
		<?php
	}

	/**
	 *	@param array $args [
	 *		'option_value' => mixed
	 *	]
	 */
	public function tinymce_ui() {

		?>
		<p><?php
		$this->checkbox_ui([
			'option_name'  => 'the_paste[tinymce_enabled]',
			'option_value' => $this->tinymce_enabled,
			'option_label' => __( 'Enable The Paste in TinyMCE', 'the-paste' ),
		]);
		?></p>
<?php /*
		<p><?php
		$this->checkbox_ui([
			'option_name'        => 'the_paste[tinymce]',
			'option_value'       => $this->tinymce,
			'option_label'       => __( 'Prefer File data when pasting.', 'the-paste' ),
			// 'option_description' => __( 'You can enable this option also in the editer toolbar.', 'the-paste' )
		]);
		?></p>
*/ ?>
		<?php

	}

	/**
	 *	@param array $args [
	 *		'option_value' => mixed
	 *	]
	 */
	public function quality_ui() {
		?>
		<label class="regular-text the-paste-quality-ui">
			<input type="range" name="the_paste[image_quality]" min="0" max="100" value="<?php echo absint( $this->image_quality ); ?>" oninput="this.nextElementSibling.value = this.value" />
			<input type="number" value="<?php echo absint( $this->image_quality ); ?>"  oninput="this.previousElementSibling.value = this.value">
		</label>
		<style>
		.the-paste-quality-ui {
			display: inline-grid;
			grid-template-columns: 1fr 80px;
			grid-gap: 1em;
		}
		</style>
		<?php
	}

	/**
	 *	@param array $args
	 */
	public function filename_ui() {

		?>
		<label>
			<input type="text" class="regular-text" name="the_paste[default_filename]" value="<?php echo esc_attr( $this->default_filename ); ?>" />
		</label>
		<div class="description">
			<style>
			#the-paste-placeholders,
			#the-paste-placeholders:not(:checked) ~ * { display:none; }
			</style>
			<p><label for="the-paste-placeholders"><a><?php esc_html_e( 'Available placeholders…', 'the-paste' ); ?></a></label></p>
			<input type="checkbox" id="the-paste-placeholders" />
			<dl>
				<dt><code>&lt;postname&gt;</code></dt>
				<dd><?php echo esc_html(
					sprintf(
						/* translators: 'Media Library' H1 from WP Core */
						__( 'Current post title if available, ‘%s’ otherwise', 'the-paste'),
						__( 'Media Library' )
					)
				); ?></dd>
				<dt><code>&lt;username&gt;</code></dt>
				<dd><?php esc_html_e('Display name of current user', 'the-paste'); ?></dd>
				<dt><code>&lt;userlogin&gt;</code></dt>
				<dd><?php esc_html_e('Login name of current user', 'the-paste'); ?></dd>
				<dt><code>&lt;userid&gt;</code></dt>
				<dd><?php esc_html_e('Current user ID', 'the-paste'); ?></dd>
			</dl>
			<p><strong><?php esc_html_e('Date and time placeholders:'); ?></strong></p>
			<dl>
				<dt><code>%Y</code></dt>
				<dd><?php esc_html_e( 'Four-digit year', 'the-paste' ); ?></dd>
				<dt><code>%y</code></dt>
				<dd><?php esc_html_e( 'Two-digit year', 'the-paste' ); ?></dd>
				<dt><code>%m</code></dt>
				<dd><?php esc_html_e( 'Number of month with leading zero (01 to 12)', 'the-paste' ); ?></dd>
				<dt><code>%d</code></dt>
				<dd><?php esc_html_e( 'Day of month with leading zero (01 to 31)', 'the-paste' ); ?></dd>
				<dt><code>%e</code></dt>
				<dd><?php esc_html_e( 'Day of month (1 to 31)', 'the-paste' ); ?></dd>
				<dt><code>%H</code></dt>
				<dd><?php esc_html_e( 'Two digit hour in 24-hour format', 'the-paste' ); ?></dd>
				<dt><code>%I</code></dt>
				<dd><?php esc_html_e( 'Two digit hour in 12-hour format', 'the-paste' ); ?></dd>
				<dt><code>%M</code></dt>
				<dd><?php esc_html_e( 'Two digit minute', 'the-paste' ); ?></dd>
				<dt><code>%S</code></dt>
				<dd><?php esc_html_e( 'Two digit second', 'the-paste' ); ?></dd>

				<dt><code>%x</code></dt>
				<dd><?php esc_html_e( 'Date based on locale', 'the-paste' ); ?></dd>
				<dt><code>%X</code></dt>
				<dd><?php esc_html_e( 'Time based on locale', 'the-paste' ); ?></dd>

				<dt><code>%s</code></dt>
				<dd><?php esc_html_e( 'Unix timestamp', 'the-paste' ); ?></dd>
			</dl>
		</div>
		<?php
	}

	/**
	 *	@param array $args
	 */
	public function donate_ui() {
		?>
		<p class="description">
			<a class="button" href="https://www.paypal.com/donate/?hosted_button_id=F8NKC6TCASUXE" target="_blank" rel="noopener">
				<span style="line-height: 1.4;" class="dashicons dashicons-heart"></span>
				<?php esc_html_e( 'Paste some cash with PayPal', 'the-paste' ); ?>
			</a>
		</p>
		<?php
	}
}
