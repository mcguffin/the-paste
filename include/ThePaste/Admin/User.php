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
		'tinymce' => true,
	];

	private $_options = null;

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {

		add_action( 'personal_options', [ $this, 'personal_options' ] );
		add_action( 'personal_options_update', [ $this, 'save_user' ] );
		add_action( 'edit_user_profile_update', [ $this, 'save_user' ] );

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

		$can_edit = user_can( $profile_user, 'edit_posts' ) || current_user_can( $profile_user, 'edit_pages' );

		if ( ! $can_edit || ! user_can( $profile_user, 'upload_files' ) ) {
			return;
		}

		?>
		<tr class="the-paste-data-urls">
			<th scope="row">
				<?php esc_html_e( 'The Paste: Enable TinyMCE', 'the-paste' ); ?>
			</th>
			<td>
				<input type="hidden" name="<?php echo $this->option_name; ?>[tinymce]" value="0" />
				<label>
					<input type="checkbox" name="<?php echo $this->option_name; ?>[tinymce]" value="1" <?php checked( $this->tinymce, true ); ?> />
					<?php esc_html_e( 'Allow pasting images in TinyMCE.', 'the-paste' ); ?>
				</label>
				<p class="description">
					<?php esc_html_e( 'If you choose to disable this, the Classic Editor will silently discard all data URI image.', 'the-paste' ); ?><br />
					<strong><?php esc_html_e( 'Please make sure to upload all of them to the media library first!', 'the-paste' ); ?></strong>
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
			$options = array_map( 'boolval', $options );
			update_user_meta( $user_id, $this->option_name, $options );
		}
	}
}
