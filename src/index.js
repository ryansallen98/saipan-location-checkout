/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { ExperimentalOrderShippingPackages } from '@woocommerce/blocks-checkout';
import { getSetting } from '@woocommerce/settings';

/**
 * Internal dependencies
 */
import { MapLocationPicker } from './components/MapLocationPicker';
const settings = getSetting( 'saipan-location-checkout_data' );

const SaipanLocationRender = () => {
	return (
		<>
			<ExperimentalOrderShippingPackages>
				<MapLocationPicker data={ settings } />
			</ExperimentalOrderShippingPackages>
		</>
	);
};

registerPlugin( 'saipan-location-checkout', {
	render: SaipanLocationRender,
	scope: 'woocommerce-checkout',
} );