<?php
/**
 *	@package ThePaste\Admin
 *	@version 1.0.0
 *	2018-09-22
 */

namespace ThePaste\Admin;

use ThePaste\Core;

class User extends Core\Singleton {

	/** @var tring */
	private $option_name = 'the_paste';

	/** @var array */
	private $defaults = [
		'tinymce_enabled'  => true,
		'tinymce'          => true,
		'datauri'          => false,
		'default_filename' => 'Pasted'
	];

	/** @var array */
	private $_options = null;

	/** @var int */
	private $_user_id = null;

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
	 *	Load options from user meta
	 */
	private function load_options() {
		if ( is_null( $this->_options ) ) {
			$this->_options = get_user_meta( get_current_user_id(), $this->option_name, true );

			if ( ! is_array( $this->_options ) ) {
				$this->_options = [];
			}
			$this->_options = wp_parse_args( $this->_options, $this->defaults );
		}
	}

	/**
	 *	Getter
	 *
	 *	@param string $what
	 */
	public function __get( $what ) {

		if ( isset( $this->defaults[$what] ) ) {
			return $this->options[$what];
		} else if ( 'user_id' === $what ) {
			if ( ! is_null( $this->_user_id ) ) {
				return $this->_user_id;
			}
			return get_current_user_id();
		} else if ( 'options' === $what ) {
			$this->load_options();
			return $this->_options;
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
			$this->load_options();
			if ( in_array( $what, [ 'tinymce', 'datauri' ] ) ) { // boolean options
				$this->_options[$what] = (boolean) $value;

			} else if ( in_array( $what, ['default_filename'] ) ) { // filename template
				$this->_options[$what] = strip_tags(trim( $value ), [ '<postname>', '<username>', '<userlogin>', '<userid>' ] );
			}
		} else if ( 'user_id' === $what ) {
			if ( $this->_user_id !== (int) $value ) {
				$this->_user_id = (int) $value;
				$this->_options = null;
			}
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
				<input type="hidden" name="<?php echo $this->option_name; ?>[tinymce_enabled]" value="0" />
				<label>
					<input type="checkbox" name="<?php echo $this->option_name; ?>[tinymce_enabled]" value="1" <?php checked( $this->tinymce, true ); ?> />
					<?php esc_html_e( 'Allow pasting files and images in Classic Editor.', 'the-paste' ); ?>
				</label>
			</td>
		</tr>

		<tr class="the-paste-tinymce">
			<th scope="row">
				<?php esc_html_e( 'The Paste Classic Editor: Paste as file', 'the-paste' ); ?>
			</th>
			<td>
				<input type="hidden" name="<?php echo $this->option_name; ?>[tinymce]" value="0" />
				<label>
					<input type="checkbox" name="<?php echo $this->option_name; ?>[tinymce]" value="1" <?php checked( $this->tinymce, true ); ?> />
					<?php esc_html_e( 'Prefer Files when pasting in Classic Editor.', 'the-paste' ); ?>
				</label>
				<p class="description">
					<?php esc_html_e( 'You can enable this option also in the editer toolbar.', 'the-paste' ); ?>
				</p>
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

			$this->user_id = $user_id;

			$options = wp_unslash( $_POST[ $this->option_name ] );

			if ( ! is_array( $options ) ) {
				$options = [];
			}
			$options = wp_parse_args( $options, $this->defaults );
			$options = array_intersect_key( $options, $this->defaults );

			foreach ( $options as $option => $value ) {
				$this->$option = $value;
			}
			$this->commit();
		}
	}

	/**
	 *	Save options
	 */
	public function commit() {
		update_user_meta( $this->user_id, $this->option_name, $this->options );
	}


}
