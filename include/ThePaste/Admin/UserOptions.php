<?php
/**
 *	@package ThePaste\Admin
 *	@version 1.0.0
 *	2018-09-22
 */

namespace ThePaste\Admin;

use ThePaste\Core;

class UserOptions extends AbstractOptions {

	/**
	 *	@inheritdoc
	 */
	protected function __construct() {

		parent::__construct();

		$this->load();

		if ( get_option( 'the_paste_enable_profile' ) && current_user_can( 'upload_files' ) ) {
			add_action( 'personal_options', [ $this, 'personal_options' ] );
			add_action( 'personal_options_update', [ $this, 'update_user' ] );
			add_action( 'edit_user_profile_update', [ $this, 'update_user' ] );
		}
	}

	/**
	 *	@inheritdoc
	 */
	public function load() {
		$this->_options = get_user_meta( get_current_user_id(), $this->option_name, true );

		if ( ! is_array( $this->_options ) ) {
			$this->_options = [];
		}

		$this->_options = wp_parse_args( $this->_options, $this->defaults );
	}

	/**
	 *	@inheritdoc
	 */
	public function save() {
		update_user_meta( get_current_user_id(), $this->option_name, $this->_options );
	}

	/**
	 *	@action personal_options
	 */
	public function personal_options( $profile_user ) {

		if ( $profile_user->ID !== get_current_user_id() ) {
			return;
		}

		$this->load();

		?>

		<tr class="the-paste-tinymce">
			<th scope="row">
				<?php esc_html_e( 'The Paste: Classic Editor', 'the-paste' ); ?>
			</th>
			<td>
				<?php $this->tinymce_ui(); ?>
			</td>
		</tr>

		<tr class="the-paste-quality">
			<th scope="row">
				<?php esc_html_e( 'The Paste: Image Quality', 'the-paste' ); ?>
			</th>
			<td>
				<?php $this->quality_ui(); ?>
			</td>
		</tr>

		<tr class="the-paste-default-filename">
			<th scope="row">
				<?php esc_html_e( 'The Paste: Default filename', 'the-paste' ); ?>
			</th>
			<td>
				<?php $this->filename_ui(); ?>
			</td>
		</tr>

		<tr class="the-paste-donate">
			<th scope="row">
				<?php esc_html_e( 'Support The Paste', 'the-paste' ); ?>
			</th>
			<td>
				<?php $this->donate_ui(); ?>
			</td>
		</tr>

		<?php
	}

	/**
	 *	@action personal_options_update
	 *	@action edit_user_profile_update
	 */
	public function update_user( $user_id ) {
		if ( isset( $_POST[ $this->option_name ] ) ) {

			$options = wp_unslash( $_POST[ $this->option_name ] );

			if ( ! is_array( $options ) ) {
				$options = [];
			}
			$options = array_intersect_key( $options, $this->defaults );
			$options = wp_parse_args( $options, $this->defaults );

			foreach ( $options as $option => $value ) {
				$this->$option = $value;
			}
			$this->save();
		}
	}

}
