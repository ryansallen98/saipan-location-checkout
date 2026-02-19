/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export default function WooInput({ label, value }) {
  const hasValidated = window.__SAIPAN_VALIDATION_TRIGGERED__;
  const isEmpty = !value;

  const showError = hasValidated && isEmpty;

  return (
    <div className={`wc-block-components-text-input ${value ? 'is-active' : ''} ${showError ? 'has-error' : ''}`}>
      <input 
        type="text" 
        id={`saipan-${label.toLowerCase()}`} 
        aria-label={label} 
        name={`saipan_${label.toLowerCase()}`} 
        value={value?.toFixed(6) || ''}
        disabled
        readOnly
      />
      <label htmlFor={`saipan-${label.toLowerCase()}`}>
        {label}
      </label>

      {showError && (
        <div className="wc-block-components-validation-error">
          { __( 'Required', 'saipan-location-checkout' ) }
        </div>
      )}
    </div>
  );
}