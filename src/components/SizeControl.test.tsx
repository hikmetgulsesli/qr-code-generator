import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SizeControl, SIZE_CONFIG, MARGIN_CONFIG } from './SizeControl';

describe('SizeControl', () => {
  const defaultProps = {
    size: 256,
    margin: 2,
    onSizeChange: vi.fn(),
    onMarginChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with size label', () => {
      render(<SizeControl {...defaultProps} />);
      expect(screen.getByText('Size')).toBeInTheDocument();
    });

    it('renders with margin label', () => {
      render(<SizeControl {...defaultProps} />);
      expect(screen.getByText('Margin')).toBeInTheDocument();
    });

    it('displays current size value with px unit', () => {
      render(<SizeControl {...defaultProps} size={256} />);
      expect(screen.getByText('256px')).toBeInTheDocument();
    });

    it('displays current margin value', () => {
      render(<SizeControl {...defaultProps} margin={2} />);
      const marginValues = screen.getAllByText('2');
      expect(marginValues.length).toBeGreaterThan(0);
    });

    it('displays size range labels', () => {
      render(<SizeControl {...defaultProps} />);
      expect(screen.getByText('128')).toBeInTheDocument();
      expect(screen.getByText('512')).toBeInTheDocument();
    });

    it('displays margin range labels', () => {
      render(<SizeControl {...defaultProps} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('has size slider with correct min/max attributes', () => {
      render(<SizeControl {...defaultProps} />);
      const sizeSlider = screen.getByLabelText('QR code size');
      expect(sizeSlider).toHaveAttribute('min', '128');
      expect(sizeSlider).toHaveAttribute('max', '512');
      expect(sizeSlider).toHaveAttribute('step', '64');
    });

    it('has margin slider with correct min/max attributes', () => {
      render(<SizeControl {...defaultProps} />);
      const marginSlider = screen.getByLabelText('QR code margin');
      expect(marginSlider).toHaveAttribute('min', '0');
      expect(marginSlider).toHaveAttribute('max', '4');
      expect(marginSlider).toHaveAttribute('step', '1');
    });

    it('applies custom className', () => {
      const { container } = render(
        <SizeControl {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('size slider has aria-valuenow attribute', () => {
      render(<SizeControl {...defaultProps} size={256} />);
      const slider = screen.getByLabelText('QR code size');
      expect(slider).toHaveAttribute('aria-valuenow', '256');
    });

    it('margin slider has aria-valuenow attribute', () => {
      render(<SizeControl {...defaultProps} margin={2} />);
      const slider = screen.getByLabelText('QR code margin');
      expect(slider).toHaveAttribute('aria-valuenow', '2');
    });

    it('has aria-valuetext for size slider', () => {
      render(<SizeControl {...defaultProps} size={256} />);
      const slider = screen.getByLabelText('QR code size');
      expect(slider).toHaveAttribute('aria-valuetext', '256');
    });

    it('has aria-valuetext for margin slider', () => {
      render(<SizeControl {...defaultProps} margin={2} />);
      const slider = screen.getByLabelText('QR code margin');
      expect(slider).toHaveAttribute('aria-valuetext', '2');
    });
  });

  describe('slider interaction', () => {
    it('calls onSizeChange when size slider changes', () => {
      const onSizeChange = vi.fn();
      render(<SizeControl {...defaultProps} onSizeChange={onSizeChange} />);
      
      const slider = screen.getByLabelText('QR code size');
      fireEvent.change(slider, { target: { value: 320 } });
      
      expect(onSizeChange).toHaveBeenCalledWith(320);
    });

    it('calls onMarginChange when margin slider changes', () => {
      const onMarginChange = vi.fn();
      render(<SizeControl {...defaultProps} onMarginChange={onMarginChange} />);
      
      const slider = screen.getByLabelText('QR code margin');
      fireEvent.change(slider, { target: { value: 3 } });
      
      expect(onMarginChange).toHaveBeenCalledWith(3);
    });

    it('updates size display when size prop changes', () => {
      const { rerender } = render(<SizeControl {...defaultProps} size={256} />);
      expect(screen.getByText('256px')).toBeInTheDocument();
      
      rerender(<SizeControl {...defaultProps} size={384} />);
      expect(screen.getByText('384px')).toBeInTheDocument();
    });

    it('updates margin display when margin prop changes', () => {
      const { rerender } = render(<SizeControl {...defaultProps} margin={2} />);
      
      // Get margin display value (second occurrence - the one in header, not range labels)
      const marginDisplays = screen.getAllByText('2');
      expect(marginDisplays.length).toBeGreaterThan(0);
      
      rerender(<SizeControl {...defaultProps} margin={4} />);
      const marginDisplays4 = screen.getAllByText('4');
      expect(marginDisplays4.length).toBeGreaterThan(0);
    });

    it('slider value matches size prop', () => {
      render(<SizeControl {...defaultProps} size={256} />);
      const slider = screen.getByLabelText('QR code size');
      expect(slider).toHaveValue('256');
    });

    it('slider value matches margin prop', () => {
      render(<SizeControl {...defaultProps} margin={2} />);
      const slider = screen.getByLabelText('QR code margin');
      expect(slider).toHaveValue('2');
    });
  });

  describe('disabled state', () => {
    it('disables size slider when disabled', () => {
      render(<SizeControl {...defaultProps} disabled />);
      const slider = screen.getByLabelText('QR code size');
      expect(slider).toBeDisabled();
    });

    it('disables margin slider when disabled', () => {
      render(<SizeControl {...defaultProps} disabled />);
      const slider = screen.getByLabelText('QR code margin');
      expect(slider).toBeDisabled();
    });

    it('does not call onSizeChange when disabled', () => {
      const onSizeChange = vi.fn();
      render(<SizeControl {...defaultProps} onSizeChange={onSizeChange} disabled />);
      
      const slider = screen.getByLabelText('QR code size');
      fireEvent.change(slider, { target: { value: 320 } });
      
      expect(onSizeChange).not.toHaveBeenCalled();
    });

    it('does not call onMarginChange when disabled', () => {
      const onMarginChange = vi.fn();
      render(<SizeControl {...defaultProps} onMarginChange={onMarginChange} disabled />);
      
      const slider = screen.getByLabelText('QR code margin');
      fireEvent.change(slider, { target: { value: 3 } });
      
      expect(onMarginChange).not.toHaveBeenCalled();
    });
  });

  describe('configuration exports', () => {
    it('exports correct SIZE_CONFIG', () => {
      expect(SIZE_CONFIG.min).toBe(128);
      expect(SIZE_CONFIG.max).toBe(512);
      expect(SIZE_CONFIG.step).toBe(64);
      expect(SIZE_CONFIG.default).toBe(256);
    });

    it('exports correct MARGIN_CONFIG', () => {
      expect(MARGIN_CONFIG.min).toBe(0);
      expect(MARGIN_CONFIG.max).toBe(4);
      expect(MARGIN_CONFIG.step).toBe(1);
      expect(MARGIN_CONFIG.default).toBe(2);
    });
  });

  describe('keyboard interaction', () => {
    it('size slider can be focused via keyboard', () => {
      render(<SizeControl {...defaultProps} />);
      const slider = screen.getByLabelText('QR code size');
      slider.focus();
      expect(slider).toHaveFocus();
    });

    it('margin slider can be focused via keyboard', () => {
      render(<SizeControl {...defaultProps} />);
      const slider = screen.getByLabelText('QR code margin');
      slider.focus();
      expect(slider).toHaveFocus();
    });

    it('size slider can receive keyboard input after focus', () => {
      const onSizeChange = vi.fn();
      render(<SizeControl {...defaultProps} onSizeChange={onSizeChange} />);
      const slider = screen.getByLabelText('QR code size');
      
      slider.focus();
      fireEvent.change(slider, { target: { value: 320 } });
      
      expect(onSizeChange).toHaveBeenCalledWith(320);
    });
  });
});
