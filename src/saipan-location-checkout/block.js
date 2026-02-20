/**
 * External dependencies
 */
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState, useCallback } from "@wordpress/element";
import { useDispatch, useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { Icon, mapMarker } from "@wordpress/icons";
import { debounce } from "lodash";

/**
 * Internal dependencies
 */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import WooCordInput from "./components/WooCordInput";
import { useIsCollectionSelected } from "./hooks/useIsCollectionSelected";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

function getCurrentLocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    onError(new Error("Geolocation is not supported by this browser."));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (err) => {
      onError(err);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}

export const Block = ({ cart, checkoutExtensionData, ...props }) => {
  const [coords, setCoords] = useState(null);
  const position = [15.18, 145.75];
  const { setExtensionData } = checkoutExtensionData;

  const packages = cart?.shippingRates || [];

  const hasSaipanDeliverySelected = packages.some((pkg) =>
    (pkg.shipping_rates || []).some(
      (rate) => rate.method_id === "saipan_delivery" && rate.selected === true,
    ),
  );

  const isCollectionActive = useIsCollectionSelected();

  const onPickLocation = (latlng) => {
    const newCoords = { lat: latlng.lat, lng: latlng.lng };
    setCoords(newCoords);
  };

  function handleLocationButtonClick() {
    getCurrentLocation(
      (location) => {
        setCoords(location);
      },
      (err) => {
        alert(
          __("Error getting location: ", "saipan-location-checkout") +
            err.message,
        );
      },
    );
  }

  const debouncedSetExtensionData = useCallback(
    debounce((namespace, key, value) => {
      setExtensionData(namespace, key, value);
    }, 1000),
    [setExtensionData],
  );

  const { setValidationErrors, clearValidationError } = useDispatch(
    "wc/store/validation",
  );

  const validationErrorId = "saipan-delivery-location-latitude";

  const validationError = useSelect((select) => {
    const store = select("wc/store/validation");
    return store.getValidationError(validationErrorId);
  });

  // Handle coords change
  useEffect(() => {
    if (!hasSaipanDeliverySelected || isCollectionActive) {
      clearValidationError(validationErrorId);
      return;
    }

    debouncedSetExtensionData(
      "saipan-delivery-location",
      "latitude",
      coords?.lat,
    );
    debouncedSetExtensionData(
      "saipan-delivery-location",
      "longitude",
      coords?.lng,
    );

    if (!coords || !coords.lat || !coords.lng) {
      setValidationErrors({
        [validationErrorId]: {
          message: __(
            "Please select a valid location on the map above.",
            "saipan-location-checkout",
          ),
          hidden: true,
        },
      });
    }

    if (coords?.lat && coords?.lng) {
      clearValidationError(validationErrorId);
    }
  }, [
    coords,
    setExtensionData,
    setValidationErrors,
    clearValidationError,
    debouncedSetExtensionData,
    hasSaipanDeliverySelected,
    isCollectionActive,
    validationErrorId,
  ]);

  if (!hasSaipanDeliverySelected || isCollectionActive) {
    return null;
  }

  return (
    <div style={{ marginTop: "24px" }}>
      <div className="wc-block-components-checkout-step__heading-container">
        <div className="wc-block-components-checkout-step__heading">
          <h3 className="wc-block-components-title">
            {__("Select Your Delivery Location", "saipan-location-checkout")}
          </h3>
        </div>
        <p className="wc-block-components-checkout-step__description">
          {__(
            "Click on the map to set your delivery location. You can also drag the marker to adjust it.",
            "saipan-location-checkout",
          )}
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
          [15.05, 145.6],
          [15.33, 145.92],
        ]}
        maxBoundsViscosity={1.0}
        minZoom={12}
        maxZoom={18}
        scrollWheelZoom={true}
        style={{ height: 300, width: "100%" }}
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
                onPickLocation(e.target.getLatLng());
              },
            }}
          >
            <Popup>
              {__(
                "Drag to adjust your delivery location",
                "saipan-location-checkout",
              )}
            </Popup>
          </Marker>
        )}

        <LocationPicker onPick={onPickLocation} />
      </MapContainer>

      <div>
        <WooCordInput
          label={__("Latitude", "saipan-location-checkout")}
          value={coords?.lat}
          error={validationError?.hidden ? null : validationError?.message}
        />
        <WooCordInput
          label={__("Longitude", "saipan-location-checkout")}
          value={coords?.lng}
          error={validationError?.hidden ? null : validationError?.message}
        />

        <button
          className="wc-block-components-button wp-element-button contained has-small-font-size is-small is-full-width"
          style={{ marginTop: "16px", marginBottom: "24px", width: "100%" }}
          type="button"
          onClick={handleLocationButtonClick}
        >
          <div
            className="wc-block-components-button__text"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Icon icon={mapMarker} size={24} />
            <div className="wc-block-components-checkout-place-order-button__text">
              {__("Use My Current Location", "saipan-location-checkout")}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
