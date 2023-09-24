<?php
/**
 *	@package ThePaste\Admin
 *	@version 1.0.0
 *	2018-09-22
 */

namespace ThePaste\Admin;

use ThePaste\Core;

class User extends Core\Singleton {

	private $option_name = 'the_paste';

	private $defaults = [
		'tinymce'          => true,
		'datauri'          => false,
		'default_filename' => 'Pasted'
	];

	private $_options = null;

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {

		add_action( 'personal_options', [ $this, 'personal_options' ] );
		add_action( 'personal_options_update', [ $this, 'save_user' ] );
		add_action( 'edit_user_profile_update', [ $this, 'save_user' ] );

		$this->defaults['default_filename'] = __( 'Pasted', 'the-paste' );

	}

	/**
	 *	Getter
	 *
	 *	@param string $what
	 */
	public function __get( $what ) {

		if ( isset( $this->defaults[$what] ) ) {
			return $this->options[$what];
		} else if ( 'options' === $what ) {
			if ( is_null( $this->_options ) ) {
				$this->_options = get_user_meta( get_current_user_id(), $this->option_name, true );

				if ( ! is_array( $this->_options ) ) {
					$this->_options = [];
				}
				$this->_options = wp_parse_args( $this->_options, $this->defaults );
			}

			return $this->_options;
		}
	}

	/**
	 *	@action personal_options
	 */
	public function personal_options( $profile_user ) {

		$can_edit = user_can( $profile_user, 'edit_posts' ) || current_user_can( 'edit_pages' );

		if ( ! $can_edit || ! user_can( $profile_user, 'upload_files' ) ) {
			return;
		}

		?>

		<tr class="the-paste-tinymce">
			<th scope="row">
				<?php esc_html_e( 'The Paste: Enable Classic Editor', 'the-paste' ); ?>
			</th>
			<td>
				<input type="hidden" name="<?php echo $this->option_name; ?>[tinymce]" value="0" />
				<label>
					<input type="checkbox" name="<?php echo $this->option_name; ?>[tinymce]" value="1" <?php checked( $this->tinymce, true ); ?> />
					<?php esc_html_e( 'Allow pasting files and images in Classic Editor.', 'the-paste' ); ?>
				</label>
			</td>
		</tr>

		<tr class="the-paste-datauri">
			<th scope="row">
				<?php esc_html_e( 'The Paste: Data URI Images', 'the-paste' ); ?>
			</th>
			<td>
				<input type="hidden" name="<?php echo $this->option_name; ?>[datauri]" value="0" />
				<label>
					<input type="checkbox" name="<?php echo $this->option_name; ?>[datauri]" value="1" <?php checked( $this->datauri, true ); ?> />
					<?php esc_html_e( 'Paste Data URI Images in Classic Editor.', 'the-paste' ); ?>
				</label>
				<p class="description">
					<?php esc_html_e( 'If this option is disabled, you can still upload existing data URI images.', 'the-paste' ); ?>
				</p>
			</td>
		</tr>

		<tr class="the-paste-default-filename">
			<th scope="row">
				<?php esc_html_e( 'The Paste: Default filename', 'the-paste' ); ?>
			</th>
			<td>
				<label>
					<input type="text" name="<?php echo $this->option_name; ?>[default_filename]" value="<?php echo esc_attr( $this->default_filename ); ?>" />
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
						<dd><?php esc_html_e('Current post title if available, empty string otherwise', 'the-paste'); ?></dd>
						<dt><code>&lt;username&gt;</code></dt>
						<dd><?php esc_html_e('Name of current user', 'the-paste'); ?></dd>
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
						<dt><code>%s</code></dt>
						<dd><?php esc_html_e( 'Unix timestamp', 'the-paste' ); ?></dd>
					</dl>
				</div>
			</td>
		</tr>

		<tr class="the-paste-donate">
			<th scope="row">
				<?php esc_html_e( 'Support The Paste', 'the-paste' ); ?>
			</th>
			<td>
				<p class="description">
					<a class="button" href="https://www.paypal.com/donate/?hosted_button_id=F8NKC6TCASUXE" target="_blank" rel="noopener">
						<span style="line-height: 1.4;" class="dashicons dashicons-heart"></span>
						<?php esc_html_e( 'Paste some cash with PayPal', 'the-paste' ); ?>
					</a>
				</p>
			</td>
		</tr>

		<?php
	}

	/**
	 *	@action personal_options_update
	 *	@action edit_user_profile_update
	 */
	public function save_user( $user_id ) {
		if ( isset( $_POST[ $this->option_name ] ) ) {
			$options = wp_unslash( $_POST[ $this->option_name ] );

			if ( ! is_array( $options ) ) {
				$options = [];
			}
			$options = wp_parse_args( $options, $this->defaults );
			$options = array_intersect_key( $options, $this->defaults );

			foreach ( $options as $option => $value ) {
				if ( in_array( $option, [ 'tinymce', 'datauri' ] ) ) { // boolean options
					$options[$option] = (boolean) $value;

				} else if ( in_array( $option, ['default_filename'] ) ) { // filename template
					$options[$option] = strip_tags(trim( $value ), [ '<postname>', '<username>' ] );
				}
			}
			update_user_meta( $user_id, $this->option_name, $options );
		}
	}
}
