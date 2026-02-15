import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Download, Check } from 'lucide-react';
import './DownloadButton.css';

/**
 * Props for the DownloadButton component
 */
export interface DownloadButtonProps {
  /** Callback when download button is clicked */
  onClick: () => void | Promise<void>;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Button text content */
  children?: React.ReactNode;
}

/**
 * Duration to show success state in milliseconds
 */
const SUCCESS_DURATION_MS = 2000;

/**
 * Download button component for triggering QR code downloads.
 * Features a primary button style with success feedback after click.
 */
export function DownloadButton({
  onClick,
  disabled = false,
  className = '',
  children = 'Download PNG',
}: DownloadButtonProps): React.ReactElement {
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (disabled || showSuccess) return;

    try {
      await onClick();
      setShowSuccess(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset success state after duration
      timeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, SUCCESS_DURATION_MS);
    } catch {
      // Error handling is up to the parent component
      // We don't show success state on error
    }
  }, [onClick, disabled, showSuccess]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <button
      type="button"
      className={`download-button ${showSuccess ? 'download-button--success' : ''} ${disabled ? 'download-button--disabled' : ''} ${className}`.trim()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-disabled={disabled}
      aria-live="polite"
    >
      {showSuccess ? (
        <>
          <Check size={20} className="download-button__icon" aria-hidden="true" />
          <span className="download-button__text">Downloaded!</span>
        </>
      ) : (
        <>
          <Download size={20} className="download-button__icon" aria-hidden="true" />
          <span className="download-button__text">{children}</span>
        </>
      )}
    </button>
  );
}
