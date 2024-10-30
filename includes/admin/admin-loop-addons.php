<div class="addon-wrap">
	<div class="thumb-wrap">
		<img src="<?php echo $addon->thumbnail;?>">
	</div>
	<h2 class="addon-title">
		<?php echo $addon->label; ?>
		<small class="addon-version">
			<?php printf( 'v%1$s', $addon->version ); ?>
		</small>
	</h2>
	<div class="addon-meta">
		<div class="addon-description">
			<span><?php echo $addon->describe; ?></span>
		</div>
		<div class="addon-new">
			<span class="addon-new-version"><?php echo $addon->lastest_version; ?></span> |
			<span class="addon-new-license">
				<?php echo $addon->license_active ? __( 'Registered', 'Lavacode' ) : __( 'Deregistered', 'Lavacode' ); ?>
			</span>
		</div>
	</div>
	<div class="addon-action">
		<?php
		if( version_compare( $addon->lastest_version, $addon->version, '>' ) ) {
			printf( "<a href=\"%s\"class=\"button button-primary\">%s</a>"
				, esc_url( network_admin_url( 'update-core.php' ) )
				, __( "Update Plugin Page", 'Lavacode' )
			);
		}else{
			printf( "<div class='addon-lastest-button'>%s</div>"
				, __( "Lastest Version", 'Lavacode' )
			);
		}

		if( $addon->license_active )
			printf( "&nbsp;<button type=\"button\" class=\"lava-addon-deactive-license button\" data-slug=\"{$slug}\">%s</button>", __( "Deactivate License", 'Lavacode' ) );
		?>
	</div>
	<?php if( !$addon->license_active ) : ?>
		<div class="addon-activator">
			<?php
			printf( "
				<div class=\"lava-addons-license-field\">
					<p>
						<label>
							%s : <br><input type=\"email\" name=\"lavaLicense[$slug]\" value=\"%s\" size=30>
						</label>
					</p>
					<p>
						<label>
							%s : <br><input type=\"text\" name=\"lavaLicense[$slug]\" size=30	>
						</label>
					</p>
					<p>
						<button type=\"button\" class=\"lava-addon-input-license button button-primary\" data-slug=\"{$slug}\">
							%s
						</button>
					</p>
				</dv>"
				, __( "Lavacode account email", 'Lavacode' )
				, esc_attr( get_bloginfo( 'admin_email' ) )
				, __( "License Key", 'Lavacode' )
				, __( "Register", 'Lavacode' )
			); ?>
		</div>
	<?php endif; ?>
</div>