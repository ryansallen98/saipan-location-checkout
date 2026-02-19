/**
 * External dependencies
 */
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WooCordInput from './WooCordInput';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FixLeafletResize() {
  const map = useMap();

  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => clearTimeout(t);
  }, [map]);

  return null;
}

function LocationPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

function sendCoordsToServer( lat, lng ) {
  fetch( '/wp-json/saipan/v1/location', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': window.wpApiSettings?.nonce,
    },
    body: JSON.stringify({ latitude: lat, longitude: lng }),
    credentials: 'same-origin',
  })
    .then( ( response ) => {
      if ( ! response.ok ) {
        throw new Error( 'HTTP ' + response.status );
      }
      return response.json();
    })
    .then( ( data ) => {
      console.log( 'Server received coords:', data );
    } )
    .catch( ( err ) => console.error( 'Error sending coords:', err ) );
}


export const MapLocationPicker = (props) => {
  const [coords, setCoords] = useState(null);
  const position = [15.18, 145.75];

  const onPickLocation = ( latlng ) => {
    const newCoords = { lat: latlng.lat, lng: latlng.lng };
    setCoords( newCoords );
    sendCoordsToServer( newCoords.lat, newCoords.lng );
  };

  // Only show on checkout
  if ( props.context !== 'woocommerce/checkout' ) {
    return null;
  }

  const packages = props.cart?.shippingRates || [];

  const hasSaipanDeliverySelected = packages.some( ( pkg ) =>
    (pkg.shipping_rates || []).some(
      ( rate ) =>
        rate.method_id === 'saipan_delivery' && rate.selected === true
    )
  );

  if ( ! hasSaipanDeliverySelected ) {
    return null;
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div className="wc-block-components-checkout-step__heading-container">
        <div className="wc-block-components-checkout-step__heading">
          <h3 className="wc-block-components-title">
            { __( 'Select Your Delivery Location', 'saipan-location-checkout' ) }
          </h3>
        </div>
        <p className="wc-block-components-checkout-step__description">
          { __( 'Click on the map to set your delivery location. You can also drag the marker to adjust it.', 'saipan-location-checkout' ) }
        </p>
      </div>

      <MapContainer
        center={position}
        zoom={13}
        bounds={[
          [15.09, 145.64],
          [15.29, 145.88],
        ]}
        maxBounds={[
          [15.05, 145.60],
          [15.33, 145.92],
        ]}
        maxBoundsViscosity={1.0}
        minZoom={12}
        maxZoom={18}
        scrollWheelZoom={true}
        style={{ height: 300, width: '100%' }}
      >
        <FixLeafletResize />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {coords && (
          <Marker
            position={[coords.lat, coords.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                onPickLocation( e.target.getLatLng() );
              },
            }}
          >
            <Popup>{ __( 'Drag to adjust your delivery location', 'saipan-location-checkout' ) }</Popup>
          </Marker>
        )}

        <LocationPicker onPick={onPickLocation} />
      </MapContainer>

      <div>
        <WooCordInput label={ __( 'Latitude', 'saipan-location-checkout' ) } value={coords?.lat} />
        <WooCordInput label={ __( 'Longitude', 'saipan-location-checkout' ) } value={coords?.lng} />
      </div>
    </div>
  );
};