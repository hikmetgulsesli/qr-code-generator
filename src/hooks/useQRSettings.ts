/**
 * QR Settings hook for managing QR code customization state
 * Persists settings to localStorage with error handling
 */

import { useState, useCallback, useEffect } from 'react';

/**
 * QR Settings state interface
 */
export interface QRSettings {
  /** Foreground color (hex) */
  foregroundColor: string;
  /** Background color (hex) */
  backgroundColor: string;
  /** QR code size in pixels */
  qrSize: number;
  /** Margin around QR code */
  margin: number;
}

/**
 * QR Settings actions interface
 */
export interface QRSettingsActions {
  /** Set foreground color */
  setForegroundColor: (color: string) => void;
  /** Set background color */
  setBackgroundColor: (color: string) => void;
  /** Set QR code size */
  setQrSize: (size: number) => void;
  /** Set margin */
  setMargin: (margin: number) => void;
  /** Reset all settings to defaults */
  resetSettings: () => void;
}

/** Default settings matching design tokens */
export const DEFAULT_SETTINGS: QRSettings = {
  foregroundColor: '#22d3ee', // Cyan accent color
  backgroundColor: '#18181b', // Dark background
  qrSize: 256,
  margin: 2,
};

/** localStorage key for settings persistence */
const STORAGE_KEY = 'qr-settings';

/**
 * Validates a hex color string
 */
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Validates QR size (must be between 64 and 1024)
 */
function isValidSize(size: number): boolean {
  return Number.isFinite(size) && size >= 64 && size <= 1024;
}

/**
 * Validates margin (must be between 0 and 10)
 */
function isValidMargin(margin: number): boolean {
  return Number.isFinite(margin) && margin >= 0 && margin <= 10;
}

/**
 * Safely loads settings from localStorage
 * Returns null if loading fails or data is invalid
 */
function loadSettingsFromStorage(): QRSettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as unknown;

    // Validate parsed data structure
    if (typeof parsed !== 'object' || parsed === null) return null;

    const data = parsed as Record<string, unknown>;

    // Validate required fields exist and have correct types
    if (typeof data.foregroundColor !== 'string') return null;
    if (typeof data.backgroundColor !== 'string') return null;
    if (typeof data.qrSize !== 'number') return null;
    if (typeof data.margin !== 'number') return null;

    // Validate values
    if (!isValidHexColor(data.foregroundColor)) return null;
    if (!isValidHexColor(data.backgroundColor)) return null;
    if (!isValidSize(data.qrSize)) return null;
    if (!isValidMargin(data.margin)) return null;

    return {
      foregroundColor: data.foregroundColor,
      backgroundColor: data.backgroundColor,
      qrSize: data.qrSize,
      margin: data.margin,
    };
  } catch {
    // localStorage access or JSON parsing failed
    return null;
  }
}

/**
 * Safely saves settings to localStorage
 * Silently fails on error (localStorage might be disabled/full)
 */
function saveSettingsToStorage(settings: QRSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage might be disabled, full, or in private mode
    // Fail silently - settings will still work in memory
  }
}

/**
 * Custom hook for managing QR code settings with localStorage persistence
 *
 * @returns Current settings and setter functions
 */
export function useQRSettings(): QRSettings & QRSettingsActions {
  // Initialize state from localStorage or defaults
  const [settings, setSettings] = useState<QRSettings>(() => {
    const stored = loadSettingsFromStorage();
    return stored ?? DEFAULT_SETTINGS;
  });

  // Persist to localStorage whenever settings change
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  const setForegroundColor = useCallback((color: string) => {
    if (!isValidHexColor(color)) return;
    setSettings((prev) => ({ ...prev, foregroundColor: color }));
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    if (!isValidHexColor(color)) return;
    setSettings((prev) => ({ ...prev, backgroundColor: color }));
  }, []);

  const setQrSize = useCallback((size: number) => {
    if (!isValidSize(size)) return;
    setSettings((prev) => ({ ...prev, qrSize: size }));
  }, []);

  const setMargin = useCallback((margin: number) => {
    if (!isValidMargin(margin)) return;
    setSettings((prev) => ({ ...prev, margin }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    ...settings,
    setForegroundColor,
    setBackgroundColor,
    setQrSize,
    setMargin,
    resetSettings,
  };
}
