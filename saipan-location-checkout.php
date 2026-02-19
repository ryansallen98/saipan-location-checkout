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










add_action( 'rest_api_init', function () {
  register_rest_route( 'saipan/v1', '/location', array(
    'methods'  => 'POST',
    'callback' => 'saipan_rest_save_location',
    'permission_callback' => '__return_true',
  ) );
} );

function saipan_rest_save_location( WP_REST_Request $request ) {
  $lat = $request->get_param( 'latitude' );
  $lng = $request->get_param( 'longitude' );

  if ( ! $lat || ! $lng ) {
    return new WP_Error( 'invalid_coords', 'Latitude or longitude missing.', array( 'status' => 400 ) );
  }

  if ( WC()->session ) {
    WC()->session->set( 'saipan_latitude', sanitize_text_field( $lat ) );
    WC()->session->set( 'saipan_longitude', sanitize_text_field( $lng ) );
  }

  return rest_ensure_response( array(
    'success' => true,
    'lat'     => $lat,
    'lng'     => $lng,
  ) );
}


add_action( 'woocommerce_store_api_checkout_update_order_from_request', function ( $order, $request ) {
    error_log( 'Store API checkout hook fired' );

    $lat = WC()->session->get( 'saipan_latitude' );
    $lng = WC()->session->get( 'saipan_longitude' );

    error_log( 'Session coords at order creation: ' . print_r( compact( 'lat', 'lng' ), true ) );

    if ( $lat && $lng ) {
        $order->update_meta_data( '_saipan_latitude', $lat );
        $order->update_meta_data( '_saipan_longitude', $lng );
    }
}, 10, 2 );


add_action( 'woocommerce_admin_order_data_after_billing_address', function ( $order ) {
  $lat = $order->get_meta( '_saipan_latitude' );
  $lng = $order->get_meta( '_saipan_longitude' );

  if ( ! $lat || ! $lng ) {
    echo '<p><em>No delivery coordinates saved.</em></p>';
    return;
  }

  echo '<div class="saipan-coords">';
  echo '<h4>Delivery Coordinates</h4>';
  echo '<p><strong>Latitude:</strong> ' . esc_html( $lat ) . '</p>';
  echo '<p><strong>Longitude:</strong> ' . esc_html( $lng ) . '</p>';
  echo '</div>';
} );


