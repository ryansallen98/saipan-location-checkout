/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';

const render = () => {};

registerPlugin('saipan-location-checkout', {
	render,
	scope: 'woocommerce-checkout',
});
