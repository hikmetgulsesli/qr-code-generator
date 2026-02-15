import React, { useCallback } from 'react';
import './SizeControl.css';

/**
 * Props for the SizeControl component
 */
export interface SizeControlProps {
  /** Current size value in pixels */
  size: number;
  /** Current margin value */
  margin: number;
  /** Callback when size changes */
  onSizeChange: (size: number) => void;
  /** Callback when margin changes */
  onMarginChange: (margin: number) => void;
  /** Additional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Size and margin configuration constants
 */
const SIZE_CONFIG = {
  min: 128,
  max: 512,
  step: 64,
  default: 256,
} as const;

const MARGIN_CONFIG = {
  min: 0,
  max: 4,
  step: 1,
  default: 2,
} as const;

/**
 * SizeControl component for customizing QR code dimensions.
 * Features range sliders for size and margin controls.
 */
export function SizeControl({
  size,
  margin,
  onSizeChange,
  onMarginChange,
  className = '',
  disabled = false,
}: SizeControlProps): React.ReactElement {
  const handleSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onSizeChange(Number(event.target.value));
      }
    },
    [onSizeChange, disabled]
  );

  const handleMarginChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onMarginChange(Number(event.target.value));
      }
    },
    [onMarginChange, disabled]
  );

  return (
    <div className={`size-control-wrapper ${className}`.trim()}>
      {/* Size Slider */}
      <div className="size-control-field">
        <div className="size-control-header">
          <label
            className="size-control-label"
            htmlFor="qr-size-slider"
          >
            Size
          </label>
          <span
            className="size-control-value"
            aria-live="polite"
          >
            {size}px
          </span>
        </div>
        <div className="size-control-slider-wrapper">
          <input
            id="qr-size-slider"
            type="range"
            className="size-control-slider"
            min={SIZE_CONFIG.min}
            max={SIZE_CONFIG.max}
            step={SIZE_CONFIG.step}
            value={size}
            onChange={handleSizeChange}
            disabled={disabled}
            aria-label="QR code size in pixels"
            aria-valuemin={SIZE_CONFIG.min}
            aria-valuemax={SIZE_CONFIG.max}
            aria-valuenow={size}
            aria-valuetext={`${size} pixels`}
          />
          <div className="size-control-range-labels">
            <span>{SIZE_CONFIG.min}px</span>
            <span>{SIZE_CONFIG.max}px</span>
          </div>
        </div>
      </div>

      {/* Margin Slider */}
      <div className="size-control-field">
        <div className="size-control-header">
          <label
            className="size-control-label"
            htmlFor="qr-margin-slider"
          >
            Margin
          </label>
          <span
            className="size-control-value"
            aria-live="polite"
          >
            {margin}
          </span>
        </div>
        <div className="size-control-slider-wrapper">
          <input
            id="qr-margin-slider"
            type="range"
            className="size-control-slider"
            min={MARGIN_CONFIG.min}
            max={MARGIN_CONFIG.max}
            step={MARGIN_CONFIG.step}
            value={margin}
            onChange={handleMarginChange}
            disabled={disabled}
            aria-label="QR code margin"
            aria-valuemin={MARGIN_CONFIG.min}
            aria-valuemax={MARGIN_CONFIG.max}
            aria-valuenow={margin}
            aria-valuetext={`${margin} modules`}
          />
          <div className="size-control-range-labels">
            <span>{MARGIN_CONFIG.min}</span>
            <span>{MARGIN_CONFIG.max}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SIZE_CONFIG, MARGIN_CONFIG };
