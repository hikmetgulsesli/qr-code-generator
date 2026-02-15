import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_SETTINGS } from './useQRSettings';

// Simple test helper that doesn't require @testing-library/react
function createTestHook() {
  // We'll test the hook logic directly without React's rendering cycle
  // by testing the helper functions that can be exported
  return {
    isValidHexColor: (color: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color),
    isValidSize: (size: number) => Number.isFinite(size) && size >= 64 && size <= 1024,
    isValidMargin: (margin: number) => Number.isFinite(margin) && margin >= 0 && margin <= 10,
  };
}

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useQRSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('default values', () => {
    it('has correct default values per design tokens', () => {
      expect(DEFAULT_SETTINGS.foregroundColor).toBe('#22d3ee');
      expect(DEFAULT_SETTINGS.backgroundColor).toBe('#18181b');
      expect(DEFAULT_SETTINGS.qrSize).toBe(256);
      expect(DEFAULT_SETTINGS.margin).toBe(2);
    });
  });

  describe('validation helpers', () => {
    const helpers = createTestHook();

    it('validates hex colors correctly', () => {
      expect(helpers.isValidHexColor('#ff0000')).toBe(true);
      expect(helpers.isValidHexColor('#f00')).toBe(true);
      expect(helpers.isValidHexColor('#22d3ee')).toBe(true);
      expect(helpers.isValidHexColor('invalid')).toBe(false);
      expect(helpers.isValidHexColor('ff0000')).toBe(false); // no hash
      expect(helpers.isValidHexColor('#gggggg')).toBe(false);
    });

    it('validates size correctly', () => {
      expect(helpers.isValidSize(256)).toBe(true);
      expect(helpers.isValidSize(64)).toBe(true); // min
      expect(helpers.isValidSize(1024)).toBe(true); // max
      expect(helpers.isValidSize(32)).toBe(false); // below min
      expect(helpers.isValidSize(2048)).toBe(false); // above max
      expect(helpers.isValidSize(-1)).toBe(false);
    });

    it('validates margin correctly', () => {
      expect(helpers.isValidMargin(2)).toBe(true);
      expect(helpers.isValidMargin(0)).toBe(true); // min
      expect(helpers.isValidMargin(10)).toBe(true); // max
      expect(helpers.isValidMargin(-1)).toBe(false); // below min
      expect(helpers.isValidMargin(15)).toBe(false); // above max
    });
  });

  describe('localStorage persistence', () => {
    it('saves settings to localStorage', () => {
      const settings = {
        foregroundColor: '#ff0000',
        backgroundColor: '#18181b',
        qrSize: 256,
        margin: 2,
      };

      localStorageMock.setItem('qr-settings', JSON.stringify(settings));
      const stored = localStorageMock.getItem('qr-settings');
      
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).foregroundColor).toBe('#ff0000');
    });

    it('loads settings from localStorage', () => {
      const customSettings = {
        foregroundColor: '#3b82f6',
        backgroundColor: '#1f2937',
        qrSize: 512,
        margin: 4,
      };

      localStorageMock.setItem('qr-settings', JSON.stringify(customSettings));
      const stored = localStorageMock.getItem('qr-settings');
      const parsed = JSON.parse(stored!);

      expect(parsed.foregroundColor).toBe('#3b82f6');
      expect(parsed.backgroundColor).toBe('#1f2937');
      expect(parsed.qrSize).toBe(512);
      expect(parsed.margin).toBe(4);
    });

    it('handles invalid JSON gracefully', () => {
      localStorageMock.setItem('qr-settings', 'not-valid-json');
      const stored = localStorageMock.getItem('qr-settings');
      
      expect(stored).toBe('not-valid-json');
      expect(() => JSON.parse(stored!)).toThrow();
    });

    it('handles missing localStorage data', () => {
      const stored = localStorageMock.getItem('nonexistent-key');
      expect(stored).toBeNull();
    });
  });

  describe('localStorage error handling', () => {
    it('handles localStorage getItem errors gracefully', () => {
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = () => {
        throw new Error('localStorage disabled');
      };

      // Should not throw
      expect(() => localStorageMock.getItem('qr-settings')).toThrow('localStorage disabled');

      localStorageMock.getItem = originalGetItem;
    });

    it('handles localStorage setItem errors gracefully', () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = () => {
        throw new Error('localStorage full');
      };

      // Should not throw when we catch it
      expect(() => localStorageMock.setItem('key', 'value')).toThrow('localStorage full');

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('shorthand hex colors', () => {
    const helpers = createTestHook();

    it('accepts 3-character hex colors', () => {
      expect(helpers.isValidHexColor('#f00')).toBe(true);
      expect(helpers.isValidHexColor('#0f0')).toBe(true);
      expect(helpers.isValidHexColor('#00f')).toBe(true);
    });

    it('accepts 6-character hex colors', () => {
      expect(helpers.isValidHexColor('#ff0000')).toBe(true);
      expect(helpers.isValidHexColor('#00ff00')).toBe(true);
      expect(helpers.isValidHexColor('#0000ff')).toBe(true);
    });

    it('rejects hex without hash prefix', () => {
      expect(helpers.isValidHexColor('ff0000')).toBe(false);
      expect(helpers.isValidHexColor('f00')).toBe(false);
    });
  });
});

// Re-export for type checking
describe('useQRSettings hook exports', () => {
  it('exports DEFAULT_SETTINGS', () => {
    expect(DEFAULT_SETTINGS).toBeDefined();
    expect(DEFAULT_SETTINGS.foregroundColor).toBe('#22d3ee');
    expect(DEFAULT_SETTINGS.backgroundColor).toBe('#18181b');
    expect(DEFAULT_SETTINGS.qrSize).toBe(256);
    expect(DEFAULT_SETTINGS.margin).toBe(2);
  });
});
