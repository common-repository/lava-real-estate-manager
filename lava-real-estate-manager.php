<?php
/**
 * Plugin Name: Lava Real Estate Manager
 * Plugin URI : http://lava-code.com/real-estate/
 * Description: Lava Real Estate Manager Plugin
 * Version: 1.0.4
 * Author: lavacode
 * Author URI: http://lava-code.com/
 * Text Domain: Lavacode
 * Domain Path: /languages/
 */
/*
    Copyright Automattic and many other contributors.

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

if( ! defined( 'ABSPATH' ) )
	die();

if( ! class_exists( 'Lava_RealEstate_Manager' ) ) :

	class Lava_RealEstate_Manager {

		private $version = '1.0.4';

		public $path = false;
		public static $instance = null;

		public function __construct( $file ) {
			$this->file = $file;
			$this->folder = basename( dirname( $this->file ) );
			$this->path = dirname( $this->file );
			$this->template_path = trailingslashit( $this->path ) . 'templates';
			$this->assets_url = esc_url( trailingslashit( plugins_url( '/assets/', $this->file ) ) );
			$this->image_url = esc_url( trailingslashit( $this->assets_url . 'images/' ) );

			register_activation_hook( $this->file, Array( $this, 'register' ) );
			register_deactivation_hook( $this->file, Array( $this, 'unregister' ) );

			$this->load_files();
			$this->register_hooks();
			$this->enqueue = new Lava_RealEstate_Manager_Enqueues;
			$this->template = new Lava_RealEstate_Manager_template;
		}

		public function getHookName( $suffix='' ) {
			$suffix = !empty( $suffix ) ? '_' . $suffix : $suffix;
			return sprintf( '%1$s%2$s', $this->getName(), $suffix );
		}

		public function register() { flush_rewrite_rules(); do_action( $this->getHookName( 'Register' ) ); }
		public function unregister(){ do_action( $this->getHookName( 'Unregister' ) ); }
		public function getVersion() { return $this->version; }
		public function getName() { return get_class( $this ); }
		public function getPluginDir() { return trailingslashit( dirname( dirname( __FILE__ ) ) ); }

		public function load_files() {
			require_once 'includes/class-lava-array.php';
			require_once 'includes/class-core.php';
			require_once 'includes/class-admin.php';
			require_once 'includes/class-enqueues.php';
			require_once 'includes/class-widgets.php';
			require_once 'includes/class-shortcodes.php';
			require_once 'includes/class-template.php';
			require_once 'includes/class-submit.php';
			require_once 'includes/class-addons.php';

			$this->core = new Lava_RealEstate_Manager_Func;
			$GLOBALS[ 'lava_realestate_manager_func' ] = $this->core;
		}

		public function register_hooks() {
			add_action( 'init', Array( $this, 'initialize' ) );
			add_action( 'widgets_init', Array( $this, 'register_sidebar' ) );
			add_action( 'widgets_init', Array( $this, 'register_widgets' ) );
			load_plugin_textdomain('Lavacode', false, $this->folder . '/languages/');
		}

		public function initialize() {
			add_rewrite_tag('%edit%', '([^&]+)');
			$this->submit = new Lava_RealEstate_Manager_Submit;
			$this->addons = new Lava_RealEstate_Manager_Addons;
			$this->admin = new Lava_RealEstate_Manager_Admin;
			do_action( 'lava_realestate_manager_init' );
		}

		public function register_sidebar() {
			$post_type = lava_realestate()->core->slug;
			register_sidebar( Array(
				'name'	=> __( "Lava Single Sidebar ({$post_type})", 'Lavacode' ),
				'id'	=> "lava-{$post_type}-single-sidebar",
			) );
		}

		public function register_widgets() {
			new Lava_RealEstate_Manager_widgets;
		}

		public static function register_role() {
			new Lava_RealEstate_Manager_role;
		}

		public static function get_instance( $file ) {
			if( null === self::$instance )
				self::$instance = new self( $file );
			return self::$instance;
		}
	}
endif;

if( !function_exists( 'lava_realestate' ) ) :
	function lava_realestate(){
		$instance = Lava_RealEstate_Manager::get_instance( __FILE__ );
		return $instance;
	}
	lava_realestate();
endif;