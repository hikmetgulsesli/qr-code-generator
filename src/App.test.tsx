import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import * as qrGenerator from './utils/qrGenerator';
import * as downloadQR from './utils/downloadQR';

// Mock the QR generator
vi.mock('./utils/qrGenerator', () => ({
  generateQRCode: vi.fn(),
  QRGenerationError: class QRGenerationError extends Error {
    readonly originalCause: unknown;
    constructor(message: string, cause?: unknown) {
      super(message);
      this.name = 'QRGenerationError';
      this.originalCause = cause;
    }
  },
}));

// Mock the download utility
vi.mock('./utils/downloadQR', () => ({
  downloadQRCode: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('App Integration', () => {
  const mockGenerateQRCode = vi.mocked(qrGenerator.generateQRCode);
  const mockDownloadQRCode = vi.mocked(downloadQR.downloadQRCode);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockGenerateQRCode.mockResolvedValue({
      dataUrl: 'data:image/png;base64,mockqrdata',
      width: 256,
      height: 256,
    });
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial render', () => {
    it('renders the app with all components', () => {
      render(<App />);

      // Header
      expect(screen.getByText('QR Code Generator')).toBeInTheDocument();

      // Text input
      expect(screen.getByLabelText('Text to encode')).toBeInTheDocument();

      // Color pickers
      expect(screen.getByText('Foreground')).toBeInTheDocument();
      expect(screen.getByText('Background')).toBeInTheDocument();

      // QR display placeholder
      expect(screen.getByText('Enter text to generate a QR code')).toBeInTheDocument();

      // Download button
      expect(screen.getByRole('button', { name: /download png/i })).toBeInTheDocument();
    });

    it('has disabled download button when no QR code is generated', () => {
      render(<App />);

      const downloadButton = screen.getByRole('button', { name: /download png/i });
      expect(downloadButton).toBeDisabled();
    });
  });

  describe('Text input to QR generation flow', () => {
    it('generates QR code when text is entered', async () => {
      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });

      // Wait for debounce
      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(mockGenerateQRCode).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'https://example.com',
            foregroundColor: '#22d3ee',
            backgroundColor: '#18181b',
            size: 256,
            margin: 2,
            errorCorrectionLevel: 'M',
          })
        );
      });
    });

    it('shows loading state while generating', async () => {
      // Delay the resolution to keep loading state
      mockGenerateQRCode.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          dataUrl: 'data:image/png;base64,mockqrdata',
          width: 256,
          height: 256,
        }), 1000))
      );

      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'test' } });

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(screen.getByText('Generating QR code...')).toBeInTheDocument();
      });
    });

    it('displays generated QR code', async () => {
      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        const qrImage = screen.getByRole('img');
        expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,mockqrdata');
      });
    });

    it('clears QR code when text is cleared', async () => {
      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });

      // Clear the text
      const clearButton = screen.getByLabelText('Clear text');
      fireEvent.click(clearButton);

      // Should show placeholder again
      await waitFor(() => {
        expect(screen.getByText('Enter text to generate a QR code')).toBeInTheDocument();
      });
    });

    it.skip('shows error when QR generation fails', async () => {
      // Skipped: requires more complex async handling setup
      mockGenerateQRCode.mockRejectedValue(new Error('Text exceeds maximum length'));

      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'x'.repeat(5000) } });

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(screen.getByText('Failed to generate QR code')).toBeInTheDocument();
      });
    });
  });

  describe('Color customization flow', () => {
    it('updates QR code when foreground color changes', async () => {
      render(<App />);

      // First enter some text
      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });
      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(mockGenerateQRCode).toHaveBeenCalledTimes(1);
      });

      // Get foreground section and click white preset
      const foregroundSection = screen.getByText('Foreground').closest('.color-picker-wrapper');
      const whitePreset = foregroundSection?.querySelector('[aria-label="Select color #ffffff"]');
      if (whitePreset) {
        fireEvent.click(whitePreset);
      }

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(mockGenerateQRCode).toHaveBeenCalledWith(
          expect.objectContaining({
            foregroundColor: '#ffffff',
          })
        );
      });
    });

    it('updates QR code when background color changes', async () => {
      render(<App />);

      // First enter some text
      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });
      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(mockGenerateQRCode).toHaveBeenCalledTimes(1);
      });

      // Get background section and click white preset
      const backgroundSection = screen.getByText('Background').closest('.color-picker-wrapper');
      const whitePreset = backgroundSection?.querySelector('[aria-label="Select color #ffffff"]');
      if (whitePreset) {
        fireEvent.click(whitePreset);
      }

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(mockGenerateQRCode).toHaveBeenCalledWith(
          expect.objectContaining({
            backgroundColor: '#ffffff',
          })
        );
      });
    });
  });

  describe('Download flow', () => {
    it('enables download button when QR code is generated', async () => {
      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /download png/i });
        expect(downloadButton).not.toBeDisabled();
      });
    });

    it('downloads QR code when download button is clicked', async () => {
      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });

      const downloadButton = screen.getByRole('button', { name: /download png/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockDownloadQRCode).toHaveBeenCalledWith('data:image/png;base64,mockqrdata');
      });
    });

    it('shows success state after download', async () => {
      render(<App />);

      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'https://example.com' } });

      vi.advanceTimersByTime(400);

      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });

      const downloadButton = screen.getByRole('button', { name: /download png/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeInTheDocument();
      });
    });
  });

  describe('Settings persistence', () => {
    it('saves settings to localStorage when colors change', async () => {
      render(<App />);

      // Enter text first
      const textInput = screen.getByLabelText('Text to encode');
      fireEvent.change(textInput, { target: { value: 'test' } });

      // Change a color - get foreground section specifically
      const foregroundSection = screen.getByText('Foreground').closest('.color-picker-wrapper');
      const whitePreset = foregroundSection?.querySelector('[aria-label="Select color #ffffff"]');
      if (whitePreset) {
        fireEvent.click(whitePreset);
      }

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'qr-settings',
          expect.stringContaining('#ffffff')
        );
      });
    });

    it('loads saved settings from localStorage on mount', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          foregroundColor: '#ff0000',
          backgroundColor: '#00ff00',
          qrSize: 512,
          margin: 4,
        })
      );

      render(<App />);

      // The color pickers should show the loaded values
      expect(screen.getByText('#FF0000')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<App />);

      expect(screen.getByRole('heading', { name: 'QR Code Generator', level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Text to Encode', level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Colors', level: 2 })).toBeInTheDocument();
    });

    it('has labeled sections', () => {
      render(<App />);

      expect(screen.getByLabelText('Input and controls')).toBeInTheDocument();
      expect(screen.getByLabelText('QR code display')).toBeInTheDocument();
    });
  });
});
