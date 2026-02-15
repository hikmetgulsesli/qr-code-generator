import React from 'react';
import { Loader2, QrCode, AlertCircle } from 'lucide-react';
import './QRDisplay.css';

/**
 * Props for the QRDisplay component
 */
export interface QRDisplayProps {
  /** Base64 data URL of the generated QR code */
  dataUrl?: string;
  /** Whether the QR code is being generated */
  isLoading?: boolean;
  /** Error message if generation failed */
  error?: string;
  /** Additional CSS class */
  className?: string;
  /** Alt text for the QR code image */
  alt?: string;
}

/**
 * QR Display component for showing generated QR codes.
 * Handles loading states, empty states, and error states.
 */
export function QRDisplay({
  dataUrl,
  isLoading = false,
  error,
  className = '',
  alt = 'Generated QR Code',
}: QRDisplayProps): React.ReactElement {
  // Loading state
  if (isLoading) {
    return (
      <div className={`qr-display-wrapper ${className}`.trim()}>
        <div className="qr-display-container qr-display-loading" role="status" aria-live="polite">
          <Loader2 size={48} className="qr-display-spinner" aria-hidden="true" />
          <p className="qr-display-loading-text">Generating QR code...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`qr-display-wrapper ${className}`.trim()}>
        <div className="qr-display-container qr-display-error" role="alert" aria-live="assertive">
          <AlertCircle size={48} className="qr-display-error-icon" aria-hidden="true" />
          <p className="qr-display-error-title">Failed to generate QR code</p>
          <p className="qr-display-error-message">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state (no data URL)
  if (!dataUrl) {
    return (
      <div className={`qr-display-wrapper ${className}`.trim()}>
        <div className="qr-display-container qr-display-empty">
          <QrCode size={48} className="qr-display-empty-icon" aria-hidden="true" />
          <p className="qr-display-empty-text">Enter text to generate a QR code</p>
        </div>
      </div>
    );
  }

  // Success state - show QR code
  return (
    <div className={`qr-display-wrapper ${className}`.trim()}>
      <div className="qr-display-container qr-display-success">
        <img
          src={dataUrl}
          alt={alt}
          className="qr-display-image"
          loading="eager"
        />
      </div>
    </div>
  );
}
