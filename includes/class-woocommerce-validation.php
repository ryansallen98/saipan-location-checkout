<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class WC_Shipping_Saipan_Delivery_Validation {

    public function __construct() {
        add_action( 'woocommerce_store_api_checkout_order_processed', [ $this, 'validate_checkout' ], 10, 1 );
    }

    public function validate_checkout( $order ) {
        // Always block checkout (for testing)
        throw new \Exception( '🚫 Test error: Checkout blocked by PHP on purpose.' );
    }
}