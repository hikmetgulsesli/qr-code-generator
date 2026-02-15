import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import type { QRHistoryItem } from '../hooks/useQRHistory';
import './HistoryList.css';

/**
 * Props for the HistoryList component
 */
export interface HistoryListProps {
  /** History items to display */
  items: QRHistoryItem[];
  /** Callback when a history item is clicked to restore */
  onRestore: (item: QRHistoryItem) => void;
  /** Callback when clear all button is clicked */
  onClear: () => void;
  /** Additional CSS class */
  className?: string;
}

/**
 * Formats a timestamp into a human-readable relative or absolute time string
 */
function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Unknown date';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Unknown date';
  }
}

/**
 * Truncates text to a maximum length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * HistoryList component displays previously generated QR codes.
 * Each item shows the encoded text, colors, and timestamp.
 * Clicking an item restores all its settings.
 */
export function HistoryList({
  items,
  onRestore,
  onClear,
  className = '',
}: HistoryListProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <div
        className={`history-list history-list--empty ${className}`.trim()}
        data-testid="history-list"
      >
        <p className="history-list-empty-text">
          No history yet. Generate a QR code to see it here.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`history-list ${className}`.trim()}
      data-testid="history-list"
    >
      <div className="history-list-header">
        <span className="history-list-count">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
        <button
          type="button"
          className="history-list-clear-btn"
          onClick={onClear}
          aria-label="Clear all history"
        >
          <Trash2 size={14} aria-hidden="true" />
          <span>Clear All</span>
        </button>
      </div>
      <ul className="history-list-items" role="list" aria-label="QR code history">
        {items.map((item) => (
          <li key={item.id} className="history-list-item">
            <button
              type="button"
              className="history-list-item-btn"
              onClick={() => onRestore(item)}
              aria-label={`Restore QR code for: ${truncateText(item.text, 50)}`}
            >
              <div className="history-list-item-colors">
                <span
                  className="history-list-color-swatch"
                  style={{ backgroundColor: item.foregroundColor }}
                  aria-label={`Foreground: ${item.foregroundColor}`}
                />
                <span
                  className="history-list-color-swatch"
                  style={{ backgroundColor: item.backgroundColor }}
                  aria-label={`Background: ${item.backgroundColor}`}
                />
              </div>
              <div className="history-list-item-content">
                <span className="history-list-item-text" title={item.text}>
                  {truncateText(item.text, 40)}
                </span>
                <span className="history-list-item-meta">
                  <Clock size={12} aria-hidden="true" />
                  <time dateTime={item.timestamp}>
                    {formatTimestamp(item.timestamp)}
                  </time>
                  <span className="history-list-item-size">
                    {item.size}px
                  </span>
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
