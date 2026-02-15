import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { TextInput } from './components/TextInput';
import { ColorPicker } from './components/ColorPicker';
import { QRDisplay } from './components/QRDisplay';
import { DownloadButton } from './components/DownloadButton';
import { useQRSettings } from './hooks/useQRSettings';
import { generateQRCode, QRGenerationError } from './utils/qrGenerator';
import { downloadQRCode } from './utils/downloadQR';
import './styles/tokens.css';
import './App.css';

/**
 * Main App component that integrates all QR code generator functionality.
 * Manages state for text input, QR generation, and coordinates between components.
 */
function App(): React.ReactElement {
  // Text input state
  const [text, setText] = useState('');

  // QR generation state
  const [dataUrl, setDataUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Settings from hook with localStorage persistence
  const {
    foregroundColor,
    backgroundColor,
    qrSize,
    margin,
    setForegroundColor,
    setBackgroundColor,
  } = useQRSettings();

  // Generate QR code when text or settings change
  useEffect(() => {
    // Clear QR if text is empty
    if (!text.trim()) {
      setDataUrl(undefined);
      setError(undefined);
      setIsLoading(false);
      return;
    }

    // Debounce generation to avoid too many updates while typing
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      setError(undefined);

      generateQRCode({
        text: text.trim(),
        foregroundColor,
        backgroundColor,
        size: qrSize,
        margin,
        errorCorrectionLevel: 'M',
      })
        .then((result) => {
          setDataUrl(result.dataUrl);
          setIsLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof QRGenerationError) {
            setError(err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred');
          }
          setDataUrl(undefined);
          setIsLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, foregroundColor, backgroundColor, qrSize, margin]);

  // Handle download button click
  const handleDownload = useCallback(() => {
    if (dataUrl) {
      downloadQRCode(dataUrl);
    }
  }, [dataUrl]);

  // Left column content: input and controls
  const leftColumn = (
    <>
      <section className="app-section" aria-labelledby="text-input-heading">
        <h2 id="text-input-heading" className="app-section-title">
          Text to Encode
        </h2>
        <TextInput
          value={text}
          onChange={setText}
          placeholder="Enter URL or text to encode..."
          maxLength={4096}
        />
      </section>

      <section className="app-section" aria-labelledby="colors-heading">
        <h2 id="colors-heading" className="app-section-title">
          Colors
        </h2>
        <div className="app-color-pickers">
          <ColorPicker
            label="Foreground"
            value={foregroundColor}
            onChange={setForegroundColor}
          />
          <ColorPicker
            label="Background"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />
        </div>
      </section>
    </>
  );

  // Right column content: QR display and download
  const rightColumn = (
    <div className="app-display-column">
      <QRDisplay
        dataUrl={dataUrl}
        isLoading={isLoading}
        error={error}
        alt={`QR code for: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`}
      />
      <DownloadButton
        onClick={handleDownload}
        disabled={!dataUrl || isLoading}
      >
        Download PNG
      </DownloadButton>
    </div>
  );

  return <Layout leftColumn={leftColumn} rightColumn={rightColumn} />;
}

export default App;
