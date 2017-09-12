<?php

if ( ! defined('ABSPATH') ) 
	die();

?>
<script type="text/html" id="tmpl-thepaste-recorder">
	<div class="recorder"></div>
	<div class="instruments">'
		<a href="#" class="button button-primary button-action" data-action="record">
			<span class="dashicons dashicons-video-alt2"></span>
			<?php _e( 'Record' , 'the-paste' ); ?>
		</a>
	</div>
	<div class="error recorder-inline-content">
		<h3><?php _e( 'An error occured.' , 'the-paste' ); ?></h3>
		<p class="camera-access-note"><?php _e( 'Please allow camera access in your browser.' , 'the-paste' ); ?>
		<p>
			<a class="button" href="#" data-action="init"><?php _e( 'Try again', 'the-paste' ); ?></a>
		</p>
	</div>
	<div class="error-">
</script>
