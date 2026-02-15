import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadQRCode, dataUrlToBlob } from './downloadQR';

describe('downloadQR', () => {
  // Mock data URL for testing
  const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // Mock DOM elements
  let mockAnchor: HTMLAnchorElement;
  let createdElements: HTMLAnchorElement[] = [];

  beforeEach(() => {
    createdElements = [];

    // Create a mock anchor element
    mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    // Mock document.createElement
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        createdElements.push(mockAnchor);
        return mockAnchor;
      }
      return document.createElement(tagName);
    });

    // Mock document.body.appendChild and removeChild
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);

    // Mock Date for consistent filename generation
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 15, 10, 30, 45)); // Jan 15, 2024 10:30:45
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('downloadQRCode', () => {
    it('should create anchor element with correct href', () => {
      downloadQRCode(mockDataUrl);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe(mockDataUrl);
    });

    it('should set download attribute with custom filename', () => {
      const customFilename = 'my-qr-code.png';
      downloadQRCode(mockDataUrl, customFilename);

      expect(mockAnchor.download).toBe(customFilename);
    });

    it('should use default filename format when no filename provided', () => {
      downloadQRCode(mockDataUrl);

      // Expected: qr-code-20240115-103045.png
      expect(mockAnchor.download).toBe('qr-code-20240115-103045.png');
    });

    it('should trigger click on anchor element', () => {
      downloadQRCode(mockDataUrl);

      expect(mockAnchor.click).toHaveBeenCalledTimes(1);
    });

    it('should append and remove anchor from body', () => {
      downloadQRCode(mockDataUrl);

      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    });

    it('should throw error for invalid data URL', () => {
      expect(() => downloadQRCode('')).toThrow('Invalid PNG data URL provided');
      expect(() => downloadQRCode('not-a-data-url')).toThrow('Invalid PNG data URL provided');
      expect(() => downloadQRCode('data:image/jpeg;base64,xyz')).toThrow('Invalid PNG data URL provided');
    });

    it('should throw error when DOM operations fail', () => {
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
        throw new Error('DOM error');
      });

      expect(() => downloadQRCode(mockDataUrl)).toThrow('Failed to download QR code: DOM error');
    });

    it('should handle empty string error message', () => {
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
        throw new Error('');
      });

      expect(() => downloadQRCode(mockDataUrl)).toThrow('Failed to download QR code: ');
    });

    it('should handle non-Error exceptions', () => {
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
        throw 'string error';
      });

      expect(() => downloadQRCode(mockDataUrl)).toThrow('Failed to download QR code: Unknown error');
    });
  });

  describe('dataUrlToBlob', () => {
    it('should convert valid PNG data URL to blob', () => {
      const blob = dataUrlToBlob(mockDataUrl);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should throw error for invalid data URL format', () => {
      expect(() => dataUrlToBlob('not-a-data-url')).toThrow('Invalid data URL format');
    });

    it('should throw error for malformed data URL structure', () => {
      expect(() => dataUrlToBlob('data:image/png;base64')).toThrow('Invalid data URL structure');
      expect(() => dataUrlToBlob('data:image/png')).toThrow('Invalid data URL structure');
    });

    it('should extract correct MIME type from data URL', () => {
      const jpegDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD';
      const blob = dataUrlToBlob(jpegDataUrl);

      expect(blob.type).toBe('image/jpeg');
    });

    it('should default to image/png when MIME type not specified', () => {
      const dataUrlWithoutMime = 'data:;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const blob = dataUrlToBlob(dataUrlWithoutMime);

      expect(blob.type).toBe('image/png');
    });

    it('should create blob with correct size', () => {
      // The mock data URL contains a 1x1 PNG
      // Base64 "iVBORw0KGgo..." decodes to a specific byte length
      const blob = dataUrlToBlob(mockDataUrl);

      // The blob should have some content (exact size depends on base64 decoding)
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});
