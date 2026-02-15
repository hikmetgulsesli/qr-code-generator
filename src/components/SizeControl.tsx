import React, { useCallback } from 'react';
import './SizeControl.css';

/**
 * Configuration for size slider
 */
export const SIZE_CONFIG = {
  min: 128,
  max: 512,
  step: 64,
  default: 256,
} as const;

/**
 * Configuration for margin slider
 */
export const MARGIN_CONFIG = {
  min: 0,
  max: 4,
  step: 1,
  default: 2,
} as const;

/**
 * Props for the SizeControl component
 */
export interface SizeControlProps {
  /** Current QR code size in pixels */
  size: number;
  /** Callback when size changes */
  onSizeChange: (size: number) => void;
  /** Current margin value */
  margin: number;
  /** Callback when margin changes */
  onMarginChange: (margin: number) => void;
  /** Additional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Size control component for customizing QR code dimensions.
 * Features range sliders for size and margin with real-time value display.
 */
export function SizeControl({
  size,
  onSizeChange,
  margin,
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
      <div className="size-control-group">
        <div className="size-control-header">
          <label className="size-control-label" htmlFor="size-slider">
            Size
          </label>
          <span className="size-control-value" data-testid="size-value" aria-live="polite">
            {size}px
          </span>
        </div>
        <div className="size-control-slider-container">
          <input
            id="size-slider"
            type="range"
            className="size-control-slider"
            min={SIZE_CONFIG.min}
            max={SIZE_CONFIG.max}
            step={SIZE_CONFIG.step}
            value={size}
            onChange={handleSizeChange}
            disabled={disabled}
            aria-label="QR code size"
            aria-valuemin={SIZE_CONFIG.min}
            aria-valuemax={SIZE_CONFIG.max}
            aria-valuenow={size}
            aria-valuetext={String(size)}
            tabIndex={0}
          />
          <div className="size-control-range-labels">
            <span className="size-control-range-label">{SIZE_CONFIG.min}</span>
            <span className="size-control-range-label">{SIZE_CONFIG.max}</span>
          </div>
        </div>
      </div>

      {/* Margin Slider */}
      <div className="size-control-group">
        <div className="size-control-header">
          <label className="size-control-label" htmlFor="margin-slider">
            Margin
          </label>
          <span className="size-control-value" data-testid="margin-value" aria-live="polite">
            {margin}
          </span>
        </div>
        <div className="size-control-slider-container">
          <input
            id="margin-slider"
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
            aria-valuetext={String(margin)}
            tabIndex={0}
          />
          <div className="size-control-range-labels">
            <span className="size-control-range-label">{MARGIN_CONFIG.min}</span>
            <span className="size-control-range-label">{MARGIN_CONFIG.max}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
