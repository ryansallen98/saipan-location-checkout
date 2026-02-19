<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class WC_Shipping_Saipan_Delivery extends WC_Shipping_Method {

	public function __construct( $instance_id = 0 ) {
		$this->id           = 'saipan_delivery';
		$this->instance_id = absint( $instance_id );

		$this->method_title       = __( 'Saipan Delivery', 'saipan-location-checkout' );
		$this->method_description = __( 'Local delivery within Saipan using map pin location.', 'saipan-location-checkout' );

		$this->supports = array(
			'shipping-zones',
			'instance-settings',
		);

		$this->has_settings = true;

		$this->init();
	}

	public function init() {
		$this->init_form_fields();
		$this->init_settings();

		$this->title   = $this->get_option( 'title', __( 'Saipan Delivery', 'saipan-location-checkout' ) );
		$this->enabled = $this->get_option( 'enabled', 'yes' );
	}

	public function init_form_fields() {
		$this->instance_form_fields = array(
			'title' => array(
				'title'       => __( 'Name', 'saipan-location-checkout' ),
				'type'        => 'text',
				'description' => __( 'Shown to customers at checkout.', 'saipan-location-checkout' ),
				'default'     => __( 'Saipan Delivery', 'saipan-location-checkout' ),
				'desc_tip'    => true,
			),
			'tax_status' => array(
				'title'       => __( 'Tax status', 'saipan-location-checkout' ),
				'type'        => 'select',
				'class'       => 'wc-enhanced-select',
				'default'     => 'taxable',
				'options'     => array(
					'taxable' => __( 'Taxable', 'saipan-location-checkout' ),
					'none'    => _x( 'None', 'Tax status', 'woocommerce' ),
				),
			),
			'cost' => array(
				'title'       => __( 'Cost', 'saipan-location-checkout' ),
				'type'        => 'price',
				'description' => __( 'Flat delivery fee.', 'saipan-location-checkout' ),
				'default'     => '0',
				'desc_tip'    => true,
			),
		);
	}

	public function calculate_shipping( $package = array() ) {
		if ( 'yes' !== $this->enabled ) {
			return;
		}

		$rate = array(
			'id'       => $this->get_rate_id(),
			'label'    => $this->title,
			'cost'     => (float) $this->get_option( 'cost', 0 ),
			'calc_tax' => 'per_order',
		);

		$this->add_rate( $rate );
	}
}