import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QRDisplay } from './QRDisplay';

describe('QRDisplay', () => {
  const mockDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  describe('empty state', () => {
    it('renders placeholder message when no dataUrl provided', () => {
      render(<QRDisplay />);
      
      const placeholderText = screen.getByText('Enter text to generate a QR code');
      expect(placeholderText).toBeInTheDocument();
    });

    it('renders QR code icon in empty state', () => {
      const { container } = render(<QRDisplay />);
      
      const icon = container.querySelector('.qr-display-empty-icon');
      expect(icon).toBeInTheDocument();
    });

    it('has correct CSS class for empty state', () => {
      const { container } = render(<QRDisplay />);
      
      const containerDiv = container.querySelector('.qr-display-empty');
      expect(containerDiv).toBeInTheDocument();
    });

    it('does not show image when dataUrl is empty string', () => {
      render(<QRDisplay dataUrl="" />);
      
      const placeholderText = screen.getByText('Enter text to generate a QR code');
      expect(placeholderText).toBeInTheDocument();
      
      const image = screen.queryByRole('img');
      expect(image).not.toBeInTheDocument();
    });

    it('does not show image when dataUrl is undefined', () => {
      render(<QRDisplay dataUrl={undefined} />);
      
      const placeholderText = screen.getByText('Enter text to generate a QR code');
      expect(placeholderText).toBeInTheDocument();
      
      const image = screen.queryByRole('img');
      expect(image).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders loading spinner when isLoading is true', () => {
      render(<QRDisplay isLoading={true} />);
      
      const loadingText = screen.getByText('Generating QR code...');
      expect(loadingText).toBeInTheDocument();
    });

    it('has correct role and aria attributes for loading state', () => {
      render(<QRDisplay isLoading={true} />);
      
      const loadingContainer = screen.getByRole('status');
      expect(loadingContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('renders spinner icon in loading state', () => {
      const { container } = render(<QRDisplay isLoading={true} />);
      
      const spinner = container.querySelector('.qr-display-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('has correct CSS class for loading state', () => {
      const { container } = render(<QRDisplay isLoading={true} />);
      
      const containerDiv = container.querySelector('.qr-display-loading');
      expect(containerDiv).toBeInTheDocument();
    });

    it('shows loading state even when dataUrl is provided', () => {
      render(<QRDisplay isLoading={true} dataUrl={mockDataUrl} />);
      
      const loadingText = screen.getByText('Generating QR code...');
      expect(loadingText).toBeInTheDocument();
      
      const image = screen.queryByRole('img');
      expect(image).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('renders error message when error prop is provided', () => {
      render(<QRDisplay error="Failed to generate" />);
      
      const errorTitle = screen.getByText('Failed to generate QR code');
      expect(errorTitle).toBeInTheDocument();
      
      const errorMessage = screen.getByText('Failed to generate');
      expect(errorMessage).toBeInTheDocument();
    });

    it('has correct role and aria attributes for error state', () => {
      render(<QRDisplay error="Something went wrong" />);
      
      const errorContainer = screen.getByRole('alert');
      expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
    });

    it('renders error icon in error state', () => {
      const { container } = render(<QRDisplay error="Error occurred" />);
      
      const errorIcon = container.querySelector('.qr-display-error-icon');
      expect(errorIcon).toBeInTheDocument();
    });

    it('has correct CSS class for error state', () => {
      const { container } = render(<QRDisplay error="Error occurred" />);
      
      const containerDiv = container.querySelector('.qr-display-error');
      expect(containerDiv).toBeInTheDocument();
    });

    it('shows error state even when dataUrl is provided', () => {
      render(<QRDisplay error="Generation failed" dataUrl={mockDataUrl} />);
      
      const errorTitle = screen.getByText('Failed to generate QR code');
      expect(errorTitle).toBeInTheDocument();
      
      const image = screen.queryByRole('img');
      expect(image).not.toBeInTheDocument();
    });

    it('displays long error messages correctly', () => {
      const longError = 'This is a very long error message that explains what went wrong in detail and should still be displayed properly within the component';
      render(<QRDisplay error={longError} />);
      
      const errorMessage = screen.getByText(longError);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    it('renders QR code image when dataUrl is provided', () => {
      render(<QRDisplay dataUrl={mockDataUrl} />);
      
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockDataUrl);
    });

    it('uses default alt text for the image', () => {
      render(<QRDisplay dataUrl={mockDataUrl} />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Generated QR Code');
    });

    it('uses custom alt text when provided', () => {
      render(<QRDisplay dataUrl={mockDataUrl} alt="Custom QR Code" />);
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Custom QR Code');
    });

    it('has correct CSS class for success state', () => {
      const { container } = render(<QRDisplay dataUrl={mockDataUrl} />);
      
      const containerDiv = container.querySelector('.qr-display-success');
      expect(containerDiv).toBeInTheDocument();
    });

    it('renders image with correct class', () => {
      const { container } = render(<QRDisplay dataUrl={mockDataUrl} />);
      
      const image = container.querySelector('.qr-display-image');
      expect(image).toBeInTheDocument();
    });
  });

  describe('className prop', () => {
    it('applies custom className to wrapper', () => {
      const { container } = render(<QRDisplay className="custom-class" />);
      
      const wrapper = container.querySelector('.qr-display-wrapper');
      expect(wrapper).toHaveClass('custom-class');
    });

    it('preserves default class when custom className is applied', () => {
      const { container } = render(<QRDisplay className="my-class" />);
      
      const wrapper = container.querySelector('.qr-display-wrapper');
      expect(wrapper).toHaveClass('qr-display-wrapper');
      expect(wrapper).toHaveClass('my-class');
    });

    it('applies custom className in loading state', () => {
      const { container } = render(<QRDisplay isLoading={true} className="loading-class" />);
      
      const wrapper = container.querySelector('.qr-display-wrapper');
      expect(wrapper).toHaveClass('loading-class');
    });

    it('applies custom className in error state', () => {
      const { container } = render(<QRDisplay error="Error" className="error-class" />);
      
      const wrapper = container.querySelector('.qr-display-wrapper');
      expect(wrapper).toHaveClass('error-class');
    });
  });

  describe('state priority', () => {
    it('loading state takes priority over error state', () => {
      render(<QRDisplay isLoading={true} error="This error should not show" />);
      
      const loadingText = screen.getByText('Generating QR code...');
      expect(loadingText).toBeInTheDocument();
      
      const errorText = screen.queryByText('Failed to generate QR code');
      expect(errorText).not.toBeInTheDocument();
    });

    it('loading state takes priority over success state', () => {
      render(<QRDisplay isLoading={true} dataUrl={mockDataUrl} />);
      
      const loadingText = screen.getByText('Generating QR code...');
      expect(loadingText).toBeInTheDocument();
      
      const image = screen.queryByRole('img');
      expect(image).not.toBeInTheDocument();
    });

    it('error state takes priority over success state', () => {
      render(<QRDisplay error="Error occurred" dataUrl={mockDataUrl} />);
      
      const errorTitle = screen.getByText('Failed to generate QR code');
      expect(errorTitle).toBeInTheDocument();
      
      const image = screen.queryByRole('img');
      expect(image).not.toBeInTheDocument();
    });

    it('error state takes priority over empty state', () => {
      render(<QRDisplay error="Error occurred" />);
      
      const errorTitle = screen.getByText('Failed to generate QR code');
      expect(errorTitle).toBeInTheDocument();
      
      const placeholderText = screen.queryByText('Enter text to generate a QR code');
      expect(placeholderText).not.toBeInTheDocument();
    });
  });
});
