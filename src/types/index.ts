/**
 * QR Code generation options
 */
export interface QRCodeOptions {
  /** Text or URL to encode */
  text: string;
  /** Foreground color (hex) */
  foregroundColor: string;
  /** Background color (hex) */
  backgroundColor: string;
  /** QR Code size in pixels */
  size: number;
  /** Error correction level */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  /** Margin around QR code */
  margin: number;
}

/**
 * QR Code generation result
 */
export interface QRCodeResult {
  /** Base64 encoded PNG data URL */
  dataUrl: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Saved QR code preset
 */
export interface QRPreset {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** QR code options */
  options: QRCodeOptions;
  /** Creation timestamp */
  createdAt: number;
}

/**
 * App theme configuration
 */
export interface ThemeConfig {
  /** Primary accent color */
  primaryColor: string;
  /** Secondary accent color */
  secondaryColor: string;
  /** Border radius preset */
  borderRadius: 'sm' | 'md' | 'lg' | 'xl';
}
