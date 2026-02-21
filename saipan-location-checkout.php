<?php
/**
 * Plugin Name:     Saipan Location Checkout
 * Plugin URI:		https://github.com/ryansallen98/saipan-location-checkout
 * Version:         1.0.0
 * Author:          Ryan Allen
 * Author URI:	 	https://github.com/ryansallen98
 * License:         MIT
 * License URI:     https://opensource.org/licenses/MIT
 * Text Domain:     saipan-location-checkout
 *
 */

// Create Saipan delivery shipping method
add_action('woocommerce_shipping_init', function () {
	require_once __DIR__ . '/includes/class-saipan-shipping-method.php';
});

// Add delivery method to Woocommerce
add_filter('woocommerce_shipping_methods', function ($methods) {
	$methods['saipan_delivery'] = 'WC_Shipping_Saipan_Delivery';
	return $methods;
});

// Load Saipan location picker block
add_action('woocommerce_blocks_loaded', function () {
	require_once __DIR__ . '/includes/class-saipan-blocks-integration.php';

	add_action(
		'woocommerce_blocks_checkout_block_registration',
		function ($integration_registry) {
			$integration_registry->register(new SaipanLocationCheckout_Blocks_Integration());
		}
	);
});

