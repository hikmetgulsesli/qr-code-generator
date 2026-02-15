import { type QRCodeOptions } from '../types';

/**
 * Default QR code generation options
 */
export const DEFAULT_QR_OPTIONS: QRCodeOptions = {
  text: '',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  size: 256,
  errorCorrectionLevel: 'M',
  margin: 4,
};

/**
 * Storage keys for localStorage
 */
export const STORAGE_KEYS = {
  QR_PRESETS: 'qr-presets',
  THEME_CONFIG: 'theme-config',
  LAST_USED_OPTIONS: 'last-used-options',
} as const;

/**
 * Validates a hex color string
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validates QR code text input
 */
export function isValidQRText(text: string): boolean {
  return text.trim().length > 0 && text.length <= 4096;
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
