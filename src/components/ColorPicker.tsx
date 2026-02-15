import React, { useCallback, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import './ColorPicker.css';

/**
 * Props for the ColorPicker component
 */
export interface ColorPickerProps {
  /** Current color value (hex) */
  value: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Label text */
  label: string;
  /** Additional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Preset color options for quick selection
 */
const PRESET_COLORS = [
  '#22d3ee', // Cyan (default accent)
  '#ffffff', // White
  '#000000', // Black
  '#f85149', // Red
  '#3fb950', // Green
  '#d29922', // Yellow/Orange
  '#a371f7', // Purple
  '#58a6ff', // Blue
  '#8b949e', // Gray
  '#ff6b9d', // Pink
];

/**
 * Color picker component for customizing QR code colors.
 * Features a native color input, color preview swatch, and preset color buttons.
 */
export function ColorPicker({
  value,
  onChange,
  label,
  className = '',
  disabled = false,
}: ColorPickerProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSwatchClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleColorChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled) {
        onChange(event.target.value);
      }
    },
    [onChange, disabled]
  );

  const handlePresetClick = useCallback(
    (color: string) => {
      if (!disabled) {
        onChange(color);
      }
    },
    [onChange, disabled]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSwatchClick();
      }
    },
    [handleSwatchClick]
  );

  return (
    <div className={`color-picker-wrapper ${className}`.trim()}>
      <label className="color-picker-label" htmlFor={`color-input-${label}`}>
        {label}
      </label>
      <div className="color-picker-controls">
        <button
          type="button"
          className={`color-picker-swatch ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={handleSwatchClick}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{ backgroundColor: value }}
          aria-label={`Select ${label.toLowerCase()} color. Current: ${value}`}
          disabled={disabled}
          tabIndex={disabled ? -1 : 0}
        >
          <span className="color-picker-swatch-inner" />
        </button>
        <input
          ref={inputRef}
          id={`color-input-${label}`}
          type="color"
          className="color-picker-native"
          value={value}
          onChange={handleColorChange}
          disabled={disabled}
          aria-label={`${label} color input`}
        />
        <span className="color-picker-value" aria-live="polite">
          {value.toUpperCase()}
        </span>
      </div>
      <div className="color-picker-presets" role="group" aria-label={`${label} preset colors`}>
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-picker-preset ${value === color ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handlePresetClick(color)}
            disabled={disabled}
            aria-label={`Select color ${color}`}
            aria-pressed={value === color}
            title={color}
          >
            {value === color && (
              <Check
                size={14}
                className="color-picker-preset-check"
                aria-hidden="true"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
