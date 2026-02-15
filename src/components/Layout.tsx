import React from 'react';
import { QrCode } from 'lucide-react';
import './Layout.css';

/**
 * Props for the Layout component
 */
export interface LayoutProps {
  /** Content for the left column (input/controls) */
  leftColumn: React.ReactNode;
  /** Content for the right column (QR display) */
  rightColumn: React.ReactNode;
  /** Additional CSS class */
  className?: string;
}

/**
 * Main application layout component.
 * Features a header with app title and a responsive two-column grid.
 * Mobile: single column, stacked
 * Desktop: input left (60%), display right (40%)
 */
export function Layout({
  leftColumn,
  rightColumn,
  className = '',
}: LayoutProps): React.ReactElement {
  return (
    <div className={`layout ${className}`.trim()}>
      <header className="layout-header">
        <div className="layout-header-content">
          <div className="layout-header-brand">
            <QrCode size={32} className="layout-header-icon" aria-hidden="true" />
            <h1 className="layout-header-title">QR Code Generator</h1>
          </div>
        </div>
      </header>
      <main className="layout-main">
        <div className="layout-container">
          <div className="layout-grid">
            <section className="layout-left-column" aria-label="Input and controls">
              {leftColumn}
            </section>
            <section className="layout-right-column" aria-label="QR code display">
              {rightColumn}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
