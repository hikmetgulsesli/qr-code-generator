import { describe, it, expect } from 'vitest';
import { generateQRCode, QRGenerationError } from './qrGenerator';
import { DEFAULT_QR_OPTIONS } from './index';
import type { QRCodeOptions } from '../types';

/**
 * Helper to build valid options with overrides.
 */
function makeOptions(overrides: Partial<QRCodeOptions> = {}): QRCodeOptions {
  return {
    ...DEFAULT_QR_OPTIONS,
    text: 'https://example.com',
    ...overrides,
  };
}

describe('generateQRCode', () => {
  describe('valid input', () => {
    it('returns a data URL for a simple URL', async () => {
      const result = await generateQRCode(makeOptions());

      expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(result.width).toBe(256);
      expect(result.height).toBe(256);
    });

    it('returns a data URL for plain text', async () => {
      const result = await generateQRCode(
        makeOptions({ text: 'Hello, World!' })
      );

      expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('respects custom size option', async () => {
      const result = await generateQRCode(makeOptions({ size: 512 }));

      expect(result.width).toBe(512);
      expect(result.height).toBe(512);
    });

    it('respects custom margin option', async () => {
      const narrowMargin = await generateQRCode(makeOptions({ margin: 0 }));
      const wideMargin = await generateQRCode(makeOptions({ margin: 10 }));

      // Both should produce valid data URLs but differ in content
      expect(narrowMargin.dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(wideMargin.dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(narrowMargin.dataUrl).not.toBe(wideMargin.dataUrl);
    });

    it('respects custom color options', async () => {
      const result = await generateQRCode(
        makeOptions({
          foregroundColor: '#ff0000',
          backgroundColor: '#00ff00',
        })
      );

      expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('works with all error correction levels', async () => {
      const levels: QRCodeOptions['errorCorrectionLevel'][] = [
        'L',
        'M',
        'Q',
        'H',
      ];

      for (const level of levels) {
        const result = await generateQRCode(
          makeOptions({ errorCorrectionLevel: level })
        );
        expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
      }
    });

    it('handles reasonably long text input', async () => {
      // QR codes have data capacity limits depending on error correction level.
      // Alphanumeric mode with low EC can hold ~4296 chars max.
      // Use a length within QR capacity to verify generation works.
      const text = 'A'.repeat(2000);
      const result = await generateQRCode(
        makeOptions({ text, errorCorrectionLevel: 'L' })
      );

      expect(result.dataUrl).toMatch(/^data:image\/png;base64,/);
    });

    it('wraps library errors for text exceeding QR capacity', async () => {
      // 4096 alphanumeric chars at high EC exceeds QR capacity
      const text = 'a'.repeat(4096);
      await expect(
        generateQRCode(makeOptions({ text, errorCorrectionLevel: 'H' }))
      ).rejects.toThrow(QRGenerationError);
      await expect(
        generateQRCode(makeOptions({ text, errorCorrectionLevel: 'H' }))
      ).rejects.toThrow('QR code generation failed');
    });

    it('produces different data URLs for different inputs', async () => {
      const result1 = await generateQRCode(
        makeOptions({ text: 'https://example.com' })
      );
      const result2 = await generateQRCode(
        makeOptions({ text: 'https://different.com' })
      );

      expect(result1.dataUrl).not.toBe(result2.dataUrl);
    });
  });

  describe('invalid input — empty/missing text', () => {
    it('rejects empty string', async () => {
      await expect(generateQRCode(makeOptions({ text: '' }))).rejects.toThrow(
        QRGenerationError
      );
      await expect(generateQRCode(makeOptions({ text: '' }))).rejects.toThrow(
        'Text input is required'
      );
    });

    it('rejects whitespace-only string', async () => {
      await expect(
        generateQRCode(makeOptions({ text: '   ' }))
      ).rejects.toThrow(QRGenerationError);
    });

    it('rejects text exceeding 4096 characters', async () => {
      const longText = 'x'.repeat(4097);
      await expect(
        generateQRCode(makeOptions({ text: longText }))
      ).rejects.toThrow(QRGenerationError);
      await expect(
        generateQRCode(makeOptions({ text: longText }))
      ).rejects.toThrow('exceeds maximum length');
    });
  });

  describe('QRGenerationError', () => {
    it('has correct name property', () => {
      const error = new QRGenerationError('test');
      expect(error.name).toBe('QRGenerationError');
    });

    it('is an instance of Error', () => {
      const error = new QRGenerationError('test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(QRGenerationError);
    });

    it('preserves the cause when provided', () => {
      const cause = new Error('root cause');
      const error = new QRGenerationError('wrapper', cause);
      expect(error.originalCause).toBe(cause);
    });

    it('stores the message', () => {
      const error = new QRGenerationError('something went wrong');
      expect(error.message).toBe('something went wrong');
    });
  });
});
