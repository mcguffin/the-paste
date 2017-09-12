<?php

if ( ! defined('ABSPATH') ) 
	die();

?>
<script type="text/html" id="tmpl-thepaste-uploader">
	<div class="image-container"></div>
	<div class="instruments">
		<button type="button" class="button image-discard button-secondary button-large button-action" data-action="discard">
			<span class="dashicons dashicons-arrow-left"></span>
			<?php _e( 'Try again', 'the-paste' ); ?>
		</button>
		<label class="setting">
			<span><?php _e( 'Title', 'the-paste' ); ?></span>
			<input class="widefat" type="text" data-setting="title" />
		</label>
		<div class="select-format" data-setting="format">
			<# jQuery.each( thepaste.options.mime_types.convert, function( mime, suffix ){
				#>
					<input type="radio" name="the-paste-upload-format" id="the-paste-format-{{{ suffix }}}" value="{{{ mime }}}" />
					<label for="the-paste-format-{{{ suffix }}}">.{{{ suffix }}}</label><br />
				<#
			}); #>
		</div>
		<button type="button" class="button image-upload button-primary button-large button-action" data-action="upload">
			<span class="dashicons dashicons-yes"></span>
			<?php _e( 'Upload', 'the-paste' ); ?>
		</button>

	</div>
</script>
