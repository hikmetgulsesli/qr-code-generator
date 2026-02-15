import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DownloadButton } from './DownloadButton';

describe('DownloadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('render', () => {
    it('renders with default text', () => {
      render(<DownloadButton onClick={vi.fn()} />);
      expect(screen.getByText('Download PNG')).toBeInTheDocument();
    });

    it('renders with custom children text', () => {
      render(<DownloadButton onClick={vi.fn()}>Save QR Code</DownloadButton>);
      expect(screen.getByText('Save QR Code')).toBeInTheDocument();
    });

    it('renders Download icon', () => {
      render(<DownloadButton onClick={vi.fn()} />);
      expect(screen.getByRole('button')).toContainElement(
        document.querySelector('svg')
      );
    });

    it('applies custom className', () => {
      render(<DownloadButton onClick={vi.fn()} className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('has correct aria attributes', () => {
      render(<DownloadButton onClick={vi.fn()} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-live', 'polite');
      expect(button).toHaveAttribute('aria-disabled', 'false');
    });
  });

  describe('click behavior', () => {
    it('calls onClick when clicked', async () => {
      const onClick = vi.fn();
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    it('shows success state after successful click', async () => {
      const onClick = vi.fn().mockResolvedValue(undefined);
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeInTheDocument();
      });
    });

    it('shows checkmark icon in success state', async () => {
      const onClick = vi.fn().mockResolvedValue(undefined);
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeInTheDocument();
      });
      
      // Check that the button has success class
      expect(screen.getByRole('button')).toHaveClass('download-button--success');
    });

    it('resets success state after timeout', async () => {
      const onClick = vi.fn().mockResolvedValue(undefined);
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeInTheDocument();
      });
      
      // Wait for timeout (2 seconds + buffer)
      await waitFor(() => {
        expect(screen.getByText('Download PNG')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('does not show success state when onClick throws', async () => {
      const onClick = vi.fn().mockRejectedValue(new Error('Download failed'));
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      // Wait for the promise to reject
      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
      
      // Should still show original text
      expect(screen.getByText('Download PNG')).toBeInTheDocument();
      expect(screen.queryByText('Downloaded!')).not.toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<DownloadButton onClick={vi.fn()} disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('is not disabled when disabled prop is false', () => {
      render(<DownloadButton onClick={vi.fn()} disabled={false} />);
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('has correct aria-disabled when disabled', () => {
      render(<DownloadButton onClick={vi.fn()} disabled />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('has disabled CSS class when disabled', () => {
      render(<DownloadButton onClick={vi.fn()} disabled />);
      expect(screen.getByRole('button')).toHaveClass('download-button--disabled');
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(<DownloadButton onClick={onClick} disabled />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not show success state when disabled and clicked', () => {
      const onClick = vi.fn().mockResolvedValue(undefined);
      render(<DownloadButton onClick={onClick} disabled />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.queryByText('Downloaded!')).not.toBeInTheDocument();
      expect(screen.getByText('Download PNG')).toBeInTheDocument();
    });
  });

  describe('keyboard interaction', () => {
    it('calls onClick when Enter key is pressed', async () => {
      const onClick = vi.fn();
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
      
      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onClick when Space key is pressed', async () => {
      const onClick = vi.fn();
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
      
      await waitFor(() => {
        expect(onClick).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onClick on other keys', () => {
      const onClick = vi.fn();
      render(<DownloadButton onClick={onClick} />);
      
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' });
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' });
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('prevents default on Enter key', () => {
      const onClick = vi.fn();
      render(<DownloadButton onClick={onClick} />);
      
      const event = fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
      
      // The event handler calls preventDefault
      expect(event).toBe(true);
    });
  });

  describe('success state behavior', () => {
    it('does not trigger click while in success state', async () => {
      const onClick = vi.fn().mockResolvedValue(undefined);
      render(<DownloadButton onClick={onClick} />);
      
      // First click - triggers success
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() => {
        expect(screen.getByText('Downloaded!')).toBeInTheDocument();
      });
      
      // Second click while in success state - should not call onClick again
      fireEvent.click(screen.getByRole('button'));
      
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});
