import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useEffect, useState } from '@wordpress/element';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ✅ Configure Leaflet marker icons ONCE (module scope)
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

export const LocationPicker = () => {
  const [coords, setCoords] = useState(null);
  const position = [15.18, 145.75];

  return (
    <div>
      <MapContainer
        center={position}
        zoom={13}
        bounds={[
          [15.09, 145.64],  // SW
          [15.29, 145.88],  // NE
        ]}
        maxBounds={[
          [15.05, 145.60],  // a slightly larger box than bounds
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

        <Marker
          position={coords ? [coords.lat, coords.lng] : position}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const latlng = e.target.getLatLng();
              setCoords({ lat: latlng.lat, lng: latlng.lng });
            },
          }}
        >
          <Popup>Drag to adjust your delivery location</Popup>
        </Marker>

        <LocationPicker onPick={setCoords} />
      </MapContainer>

       <div>
          <div className={`wc-block-components-text-input ${coords ? 'is-active' : ''}`}>
            <input 
              type="text" 
              id="shipping-latitude" 
              autocapitalize="sentences" 
              aria-label="Latitude" 
              name="shipping_latitude" 
              value={coords?.lat?.toFixed(6) || ''}
              readOnly
            />
            <label htmlFor="shipping-latitude">
              Latitude
            </label>
          </div>

          <div className={`wc-block-components-text-input ${coords ? 'is-active' : ''}`}>
            <input 
              type="text" 
              id="shipping-longitude" 
              autocapitalize="sentences" 
              aria-label="Longitude" 
              aria-invalid="false" 
              name="shipping_longitude" 
              value={coords?.lng?.toFixed(6) || ''}
              readOnly
            />
            <label htmlFor="shipping-longitude">
              Longitude
            </label>
          </div>
       </div>
    </div>
  );
};