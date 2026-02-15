import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { TextInput } from './components/TextInput';
import { ColorPicker } from './components/ColorPicker';
import { SizeControl } from './components/SizeControl';
import { QRDisplay } from './components/QRDisplay';
import { DownloadButton } from './components/DownloadButton';
import { HistoryList } from './components/HistoryList';
import { useQRSettings } from './hooks/useQRSettings';
import { useQRHistory } from './hooks/useQRHistory';
import type { QRHistoryItem } from './hooks/useQRHistory';
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
    setQrSize,
    setMargin,
  } = useQRSettings();

  // History hook for storing previously generated QR codes
  const { history, addToHistory, clearHistory } = useQRHistory();

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

  // Track the last text that was added to history to avoid duplicates
  const lastHistoryTextRef = React.useRef<string>('');

  // Add to history when QR code is successfully generated
  useEffect(() => {
    if (dataUrl && text.trim() && !isLoading && !error) {
      const trimmedText = text.trim();
      // Avoid adding duplicate consecutive entries
      if (lastHistoryTextRef.current !== trimmedText) {
        lastHistoryTextRef.current = trimmedText;
        addToHistory({
          text: trimmedText,
          foregroundColor,
          backgroundColor,
          size: qrSize,
          margin,
        });
      }
    }
  }, [dataUrl, text, isLoading, error, foregroundColor, backgroundColor, qrSize, margin, addToHistory]);

  // Handle restoring a history item
  const handleRestore = useCallback(
    (item: QRHistoryItem) => {
      setText(item.text);
      setForegroundColor(item.foregroundColor);
      setBackgroundColor(item.backgroundColor);
      setQrSize(item.size);
      setMargin(item.margin);
      lastHistoryTextRef.current = item.text;
    },
    [setForegroundColor, setBackgroundColor, setQrSize, setMargin]
  );

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

      <section className="app-section" aria-labelledby="size-heading">
        <h2 id="size-heading" className="app-section-title">
          Size & Margin
        </h2>
        <SizeControl
          size={qrSize}
          margin={margin}
          onSizeChange={setQrSize}
          onMarginChange={setMargin}
        />
      </section>

      <section className="app-section" aria-labelledby="history-heading">
        <h2 id="history-heading" className="app-section-title">
          History
        </h2>
        <HistoryList
          items={history}
          onRestore={handleRestore}
          onClear={clearHistory}
        />
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
