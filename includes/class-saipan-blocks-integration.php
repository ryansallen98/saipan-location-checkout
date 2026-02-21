<?php
if (!defined('ABSPATH'))
	exit;

use Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface;

define('SaipanLocationCheckout_VERSION', '0.1.0');

/**
 * Class for integrating with WooCommerce Blocks
 */
class SaipanLocationCheckout_Blocks_Integration implements IntegrationInterface
{

	/**
	 * The name of the integration.
	 *
	 * @return string
	 */
	public function get_name()
	{
		return 'saipan-location-checkout';
	}

	/**
	 * When called invokes any initialization/setup for the integration.
	 *
	 */
	public function initialize()
	{
		require_once __DIR__ . '/class-extend-store-api.php';

		$script_path = 'build/saipan-location-checkout/index.js';
		$style_path = 'build/saipan-location-checkout/index.css';

		$plugin_url = plugin_dir_url(dirname(__FILE__));
		$plugin_path = plugin_dir_path(dirname(__FILE__));

		$script_url = $plugin_url . $script_path;
		$style_url = $plugin_url . $style_path;

		$script_asset_path = $plugin_path . 'build/saipan-location-checkout/index.asset.php';

		$script_asset = file_exists($script_asset_path)
			? require $script_asset_path
			: array(
				'dependencies' => array(),
				'version' => SaipanLocationCheckout_VERSION,
			);

		wp_enqueue_style(
			'saipan-location-checkout-blocks-integration',
			$style_url,
			[],
			$script_asset['version']
		);

		$deps = $script_asset['dependencies'] ?? array();

		// Ensure wp-api is loaded so window.wpApiSettings exists
		if (!in_array('wp-api', $deps, true)) {
			$deps[] = 'wp-api';
		}


		wp_register_script(
			'saipan-location-checkout-blocks-integration',
			$script_url,
			$deps,
			$script_asset['version'],
			true
		);

		wp_set_script_translations(
			'saipan-location-checkout-blocks-integration',
			'saipan-location-checkout',
			dirname(__FILE__) . '/../languages'
		);

		$this->extend_store_api();
		$this->save_location();
		$this->show_location_in_order();
	}

	/**
	 * Returns an array of script handles to enqueue in the frontend context.
	 *
	 * @return string[]
	 */
	public function get_script_handles()
	{
		return array('saipan-location-checkout-blocks-integration');
	}

	/**
	 * Returns an array of script handles to enqueue in the editor context.
	 *
	 * @return string[]
	 */
	public function get_editor_script_handles()
	{
		return array('saipan-location-checkout-blocks-integration');
	}

	/**
	 * An array of key, value pairs of data made available to the block on the client side.
	 *
	 * @return array
	 */
	public function get_script_data()
	{
		return array(
			'saipan-location-checkout-active' => true,
		);
	}

	/**
	 * Extends the cart schema to include the saipan location checkout data.
	 */
	private function extend_store_api()
	{
		SaipanLocationCheckout_Extend_Store_Endpoint::init();
	}

	private function save_location()
	{
		add_action(
			'woocommerce_store_api_checkout_update_order_from_request',
			function (\WC_Order $order, \WP_REST_Request $request) {
				debug_log('woocommerce_store_api_checkout_update_order_from_request fired');
			},
			10,
			2
		);
	}

	/**
	 * Adds the address in the order page in WordPress admin.
	 */
	private function show_location_in_order()
	{
		add_action(
    'woocommerce_store_api_checkout_update_order_from_request',
    function( $order, $request ) {
        $extensions = $request['extensions']['saipan-location-checkout'] ?? [];
		debug_log('Saving order meta data from store API request');

        if ( isset( $extensions['latitude'] ) ) {
            $order->update_meta_data( '_saipan_latitude', sanitize_text_field( $extensions['latitude'] ) );
        }

        if ( isset( $extensions['longitude'] ) ) {
            $order->update_meta_data( '_saipan_longitude', sanitize_text_field( $extensions['longitude'] ) );
        }
		debug_log('Order meta data updated: ' . print_r($order->get_meta_data(), true));

		$order->save();
    },
    10,
    2
);


		add_action(
			'woocommerce_admin_order_data_after_shipping_address',
			function (\WC_Order $order) {
				$saipan_location_latitude = $order->get_meta('saipan_location_latitude');
				$saipan_location_longitude = $order->get_meta('saipan_location_longitude');

				// var_dump($order)
	
				// if ($saipan_location_latitude === '' || $saipan_location_longitude === '') {
				// 	return;
				// }
	
				?>
			<div class="saipan-location-meta">
				<h3><?php _e('Saipan Location Checkout', 'saipan-location-checkout'); ?></h3>
				<p>
					<strong><?php _e('Latitude', 'saipan-location-checkout'); ?>:</strong>
					<?php echo esc_html($saipan_location_latitude ?: '—'); ?>
				</p>
				<p>
					<strong><?php _e('Longitude', 'saipan-location-checkout'); ?>:</strong>
					<?php echo esc_html($saipan_location_longitude ?: '—'); ?>
				</p>

				<a class="button button-primary"
					href="https://www.google.com/maps?q=<?php echo esc_attr($saipan_location_latitude . ',' . $saipan_location_longitude); ?>"
					target="_blank">
					View on map
				</a>
			</div>

			<?php
			}
		);
	}

	/**
	 * Get the file modified time as a cache buster if we're in dev mode.
	 *
	 * @param string $file Local path to the file.
	 * @return string The cache buster value to use for the given file.
	 */
	protected function get_file_version($file)
	{
		if (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG && file_exists($file)) {
			return filemtime($file);
		}
		return SaipanLocationCheckout_VERSION;
	}
}