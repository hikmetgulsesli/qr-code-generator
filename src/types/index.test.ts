import { describe, it, expect } from 'vitest';
import type { QRCodeOptions, QRPreset, ThemeConfig } from './index';

describe('types', () => {
  describe('QRCodeOptions interface', () => {
    it('should accept valid QR code options', () => {
      const options: QRCodeOptions = {
        text: 'https://example.com',
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        size: 256,
        errorCorrectionLevel: 'M',
        margin: 4,
      };
      
      expect(options.text).toBe('https://example.com');
      expect(options.foregroundColor).toBe('#000000');
      expect(options.size).toBe(256);
    });

    it('should accept all error correction levels', () => {
      const levels: Array<QRCodeOptions['errorCorrectionLevel']> = ['L', 'M', 'Q', 'H'];
      
      levels.forEach((level) => {
        const options: QRCodeOptions = {
          text: 'test',
          foregroundColor: '#000',
          backgroundColor: '#fff',
          size: 128,
          errorCorrectionLevel: level,
          margin: 2,
        };
        expect(options.errorCorrectionLevel).toBe(level);
      });
    });
  });

  describe('QRPreset interface', () => {
    it('should accept valid preset', () => {
      const preset: QRPreset = {
        id: '123',
        name: 'My Preset',
        options: {
          text: 'https://example.com',
          foregroundColor: '#000000',
          backgroundColor: '#ffffff',
          size: 256,
          errorCorrectionLevel: 'M',
          margin: 4,
        },
        createdAt: Date.now(),
      };
      
      expect(preset.id).toBe('123');
      expect(preset.name).toBe('My Preset');
      expect(preset.createdAt).toBeGreaterThan(0);
    });
  });

  describe('ThemeConfig interface', () => {
    it('should accept valid theme config', () => {
      const config: ThemeConfig = {
        primaryColor: '#58a6ff',
        secondaryColor: '#3fb950',
        borderRadius: 'md',
      };
      
      expect(config.primaryColor).toBe('#58a6ff');
      expect(config.borderRadius).toBe('md');
    });

    it('should accept all border radius options', () => {
      const radii: Array<ThemeConfig['borderRadius']> = ['sm', 'md', 'lg', 'xl'];
      
      radii.forEach((radius) => {
        const config: ThemeConfig = {
          primaryColor: '#58a6ff',
          secondaryColor: '#3fb950',
          borderRadius: radius,
        };
        expect(config.borderRadius).toBe(radius);
      });
    });
  });
});
