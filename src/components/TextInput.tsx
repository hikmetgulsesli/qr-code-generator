import React, { useCallback } from 'react';
import { X } from 'lucide-react';
import './TextInput.css';

/**
 * Props for the TextInput component
 */
export interface TextInputProps {
  /** Current text value */
  value: string;
  /** Callback when text changes */
  onChange: (value: string) => void;
  /** Maximum character length */
  maxLength?: number;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS class */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Text input component for entering URLs/text to encode into QR codes.
 * Features a large textarea, character counter, and clear button.
 */
export function TextInput({
  value,
  onChange,
  maxLength,
  placeholder = 'Enter URL or text to encode...',
  className = '',
  disabled = false,
}: TextInputProps): React.ReactElement {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (disabled) {
        return;
      }
      const newValue = event.target.value;
      if (maxLength && newValue.length > maxLength) {
        return;
      }
      onChange(newValue);
    },
    [onChange, maxLength, disabled]
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const currentLength = value.length;
  const isNearLimit = maxLength && currentLength > maxLength * 0.9;
  const isAtLimit = maxLength && currentLength >= maxLength;

  return (
    <div className={`text-input-wrapper ${className}`.trim()}>
      <div className="text-input-container">
        <textarea
          className="text-input-textarea"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={6}
          aria-label="Text to encode"
          aria-describedby="text-input-counter"
          maxLength={maxLength || 4096}
        />
        {value.length > 0 && !disabled && (
          <button
            type="button"
            className="text-input-clear"
            onClick={handleClear}
            aria-label="Clear text"
            title="Clear text"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div className="text-input-footer">
        <span
          id="text-input-counter"
          className={`text-input-counter ${isNearLimit ? 'near-limit' : ''} ${isAtLimit ? 'at-limit' : ''}`}
          aria-live="polite"
        >
          {currentLength}
          {maxLength && maxLength > 0 && ` / ${maxLength}`}
        </span>
      </div>
    </div>
  );
}
