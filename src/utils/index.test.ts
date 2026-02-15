import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_QR_OPTIONS, 
  STORAGE_KEYS, 
  isValidHexColor, 
  isValidQRText, 
  generateId 
} from '../utils';

describe('utils', () => {
  describe('DEFAULT_QR_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_QR_OPTIONS.text).toBe('');
      expect(DEFAULT_QR_OPTIONS.foregroundColor).toBe('#000000');
      expect(DEFAULT_QR_OPTIONS.backgroundColor).toBe('#ffffff');
      expect(DEFAULT_QR_OPTIONS.size).toBe(256);
      expect(DEFAULT_QR_OPTIONS.errorCorrectionLevel).toBe('M');
      expect(DEFAULT_QR_OPTIONS.margin).toBe(4);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should define all storage keys', () => {
      expect(STORAGE_KEYS.QR_PRESETS).toBe('qr-presets');
      expect(STORAGE_KEYS.THEME_CONFIG).toBe('theme-config');
      expect(STORAGE_KEYS.LAST_USED_OPTIONS).toBe('last-used-options');
    });
  });

  describe('isValidHexColor', () => {
    it('should return true for valid 6-digit hex colors', () => {
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#58a6ff')).toBe(true);
    });

    it('should return true for valid 3-digit hex colors', () => {
      expect(isValidHexColor('#000')).toBe(true);
      expect(isValidHexColor('#FFF')).toBe(true);
      expect(isValidHexColor('#abc')).toBe(true);
    });

    it('should return false for invalid hex colors', () => {
      expect(isValidHexColor('000000')).toBe(false);
      expect(isValidHexColor('#GGGGGG')).toBe(false);
      expect(isValidHexColor('#12345')).toBe(false);
      expect(isValidHexColor('#1234567')).toBe(false);
      expect(isValidHexColor('')).toBe(false);
    });
  });

  describe('isValidQRText', () => {
    it('should return true for valid text', () => {
      expect(isValidQRText('Hello World')).toBe(true);
      expect(isValidQRText('https://example.com')).toBe(true);
      expect(isValidQRText('  trimmed  ')).toBe(true);
    });

    it('should return false for empty or whitespace-only text', () => {
      expect(isValidQRText('')).toBe(false);
      expect(isValidQRText('   ')).toBe(false);
    });

    it('should return false for text exceeding max length', () => {
      const longText = 'a'.repeat(4097);
      expect(isValidQRText(longText)).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate string IDs', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });
});
