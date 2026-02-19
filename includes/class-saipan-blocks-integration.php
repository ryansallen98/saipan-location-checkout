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
		$script_path = 'build/index.js';
		$style_path = 'build/index.css';

		$plugin_url = plugin_dir_url(dirname(__FILE__));
		$plugin_path = plugin_dir_path(dirname(__FILE__));

		$script_url = $plugin_url . $script_path;
		$style_url = $plugin_url . $style_path;

		$script_asset_path = $plugin_path . 'build/index.asset.php';

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