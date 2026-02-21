<?php
use Automattic\WooCommerce\Blocks\Package;
use Automattic\WooCommerce\Blocks\StoreApi\Schemas\CartSchema;
use Automattic\WooCommerce\Blocks\StoreApi\Schemas\CheckoutSchema;

/**
 * Saipan Location Checkout Extend Store API.
 */
class SaipanLocationCheckout_Extend_Store_Endpoint
{
    /**
     * Stores Rest Extending instance.
     *
     * @var ExtendRestApi
     */
    private static $extend;

    /**
     * Plugin Identifier, unique to each plugin.
     *
     * @var string
     */
    const IDENTIFIER = 'saipan-location-checkout';

    /**
     * Bootstraps the class and hooks required data.
     *
     */
    public static function init()
    {
        self::$extend = Automattic\WooCommerce\StoreApi\StoreApi::container()->get(Automattic\WooCommerce\StoreApi\Schemas\ExtendSchema::class);
        self::extend_store();
    }

    /**
     * Registers the actual data into each endpoint.
     */
    public static function extend_store()
    {
        /**
         * [backend-step-02]
         * 📝 Once the `extend_checkout_schema` method is complete (see [backend-step-01]) you can 
         * uncomment the code below.
         */
        if (is_callable([self::$extend, 'register_endpoint_data'])) {
            self::$extend->register_endpoint_data(
                [
                    'endpoint' => CheckoutSchema::IDENTIFIER,
                    'namespace' => self::IDENTIFIER,
                    'schema_callback' => ['SaipanLocationCheckout_Extend_Store_Endpoint', 'extend_checkout_schema'],
                    'schema_type' => ARRAY_A,
                ]
            );
        }
    }


    /**
     * Register saipan location checkout schema into the Checkout endpoint.
     *
     * @return array Registered schema.
     *
     */
    public static function extend_checkout_schema()
    {
        return [
            'latitude' => [
                'description' => __('The latitude of the delivery location selected by the shopper', 'saipan-location-checkout'),
                'type' => 'string',
                'context' => ['view', 'edit'],
                // 'readonly' => true,
                // 'optional' => true,
                'arg_options' => [
                    'validate_callback' => function ($value) {
                        return is_string($value);
                    },
                ]
            ],
            'longitude' => [
                'description' => __('The longitude of the delivery location selected by the shopper', 'saipan-location-checkout'),
                'type' => 'string',
                'context' => ['view', 'edit'],
                // 'readonly' => true,
                // 'optional' => true,
                'arg_options' => [
                    'validate_callback' => function ($value) {
                        return is_string($value);
                    },
                ]
            ],
        ];
    }
}
