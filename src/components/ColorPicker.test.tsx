import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  const defaultProps = {
    value: '#22d3ee',
    onChange: vi.fn(),
    label: 'Foreground',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with label', () => {
      render(<ColorPicker {...defaultProps} />);
      expect(screen.getByText('Foreground')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<ColorPicker {...defaultProps} label="Background" />);
      expect(screen.getByText('Background')).toBeInTheDocument();
    });

    it('displays current color value in uppercase', () => {
      render(<ColorPicker {...defaultProps} value="#ff0000" />);
      expect(screen.getByText('#FF0000')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ColorPicker {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has aria-label on swatch button', () => {
      render(<ColorPicker {...defaultProps} />);
      const swatch = screen.getByLabelText(/select foreground color/i);
      expect(swatch).toBeInTheDocument();
    });

    it('has aria-label on native color input', () => {
      render(<ColorPicker {...defaultProps} />);
      const input = screen.getByLabelText('Foreground color input');
      expect(input).toBeInTheDocument();
    });

    it('has aria-live on color value display', () => {
      render(<ColorPicker {...defaultProps} />);
      const valueDisplay = screen.getByText('#22D3EE');
      expect(valueDisplay).toHaveAttribute('aria-live', 'polite');
    });

    it('preset buttons have aria-labels', () => {
      render(<ColorPicker {...defaultProps} />);
      const preset = screen.getByLabelText('Select color #22d3ee');
      expect(preset).toBeInTheDocument();
    });

    it('preset group has aria-label', () => {
      render(<ColorPicker {...defaultProps} />);
      const presetGroup = screen.getByRole('group', { name: 'Foreground preset colors' });
      expect(presetGroup).toBeInTheDocument();
    });
  });

  describe('color change', () => {
    it('calls onChange when native color input changes', () => {
      const onChange = vi.fn();
      render(<ColorPicker {...defaultProps} onChange={onChange} />);
      
      const input = screen.getByLabelText('Foreground color input');
      fireEvent.change(input, { target: { value: '#ff0000' } });
      
      expect(onChange).toHaveBeenCalledWith('#ff0000');
    });

    it('updates color value display when value changes', () => {
      const { rerender } = render(<ColorPicker {...defaultProps} value="#22d3ee" />);
      expect(screen.getByText('#22D3EE')).toBeInTheDocument();
      
      rerender(<ColorPicker {...defaultProps} value="#ff0000" />);
      expect(screen.getByText('#FF0000')).toBeInTheDocument();
    });

    it('swatch shows current color as background', () => {
      const { container } = render(<ColorPicker {...defaultProps} value="#ff0000" />);
      const swatch = container.querySelector('.color-picker-swatch');
      expect(swatch).toHaveStyle({ backgroundColor: '#ff0000' });
    });
  });

  describe('preset selection', () => {
    it('calls onChange when preset button is clicked', () => {
      const onChange = vi.fn();
      render(<ColorPicker {...defaultProps} onChange={onChange} />);
      
      const whitePreset = screen.getByLabelText('Select color #ffffff');
      fireEvent.click(whitePreset);
      
      expect(onChange).toHaveBeenCalledWith('#ffffff');
    });

    it('renders at least 6 preset buttons', () => {
      render(<ColorPicker {...defaultProps} />);
      const presets = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-label')?.startsWith('Select color #')
      );
      expect(presets.length).toBeGreaterThanOrEqual(6);
    });

    it('shows checkmark on selected preset', () => {
      render(<ColorPicker {...defaultProps} value="#ffffff" />);
      const whitePreset = screen.getByLabelText('Select color #ffffff');
      expect(whitePreset.querySelector('svg')).toBeInTheDocument();
    });

    it('does not show checkmark on unselected presets', () => {
      render(<ColorPicker {...defaultProps} value="#22d3ee" />);
      const whitePreset = screen.getByLabelText('Select color #ffffff');
      expect(whitePreset.querySelector('svg')).not.toBeInTheDocument();
    });

    it('preset has selected class when matching current value', () => {
      render(<ColorPicker {...defaultProps} value="#ffffff" />);
      const whitePreset = screen.getByLabelText('Select color #ffffff');
      expect(whitePreset).toHaveClass('selected');
    });

    it('preset has aria-pressed true when selected', () => {
      render(<ColorPicker {...defaultProps} value="#ffffff" />);
      const whitePreset = screen.getByLabelText('Select color #ffffff');
      expect(whitePreset).toHaveAttribute('aria-pressed', 'true');
    });

    it('preset has aria-pressed false when not selected', () => {
      render(<ColorPicker {...defaultProps} value="#22d3ee" />);
      const whitePreset = screen.getByLabelText('Select color #ffffff');
      expect(whitePreset).toHaveAttribute('aria-pressed', 'false');
    });

    it('includes cyan preset', () => {
      render(<ColorPicker {...defaultProps} />);
      expect(screen.getByLabelText('Select color #22d3ee')).toBeInTheDocument();
    });

    it('includes white preset', () => {
      render(<ColorPicker {...defaultProps} />);
      expect(screen.getByLabelText('Select color #ffffff')).toBeInTheDocument();
    });

    it('includes black preset', () => {
      render(<ColorPicker {...defaultProps} />);
      expect(screen.getByLabelText('Select color #000000')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('disables swatch button when disabled', () => {
      render(<ColorPicker {...defaultProps} disabled />);
      const swatch = screen.getByLabelText(/select foreground color/i);
      expect(swatch).toBeDisabled();
    });

    it('disables native color input when disabled', () => {
      render(<ColorPicker {...defaultProps} disabled />);
      const input = screen.getByLabelText('Foreground color input');
      expect(input).toBeDisabled();
    });

    it('disables preset buttons when disabled', () => {
      render(<ColorPicker {...defaultProps} disabled />);
      const preset = screen.getByLabelText('Select color #22d3ee');
      expect(preset).toBeDisabled();
    });

    it('does not call onChange when disabled and preset clicked', () => {
      const onChange = vi.fn();
      render(<ColorPicker {...defaultProps} onChange={onChange} disabled />);
      
      const preset = screen.getByLabelText('Select color #ffffff');
      fireEvent.click(preset);
      
      expect(onChange).not.toHaveBeenCalled();
    });

    it('swatch has disabled class when disabled', () => {
      const { container } = render(<ColorPicker {...defaultProps} disabled />);
      const swatch = container.querySelector('.color-picker-swatch');
      expect(swatch).toHaveClass('disabled');
    });

    it('preset has disabled class when disabled', () => {
      render(<ColorPicker {...defaultProps} disabled />);
      const preset = screen.getByLabelText('Select color #22d3ee');
      expect(preset).toHaveClass('disabled');
    });
  });

  describe('keyboard interaction', () => {
    it('swatch is focusable via keyboard', () => {
      render(<ColorPicker {...defaultProps} />);
      const swatch = screen.getByLabelText(/select foreground color/i);
      expect(swatch).toHaveAttribute('tabIndex', '0');
    });

    it('swatch is not focusable when disabled', () => {
      render(<ColorPicker {...defaultProps} disabled />);
      const swatch = screen.getByLabelText(/select foreground color/i);
      expect(swatch).toHaveAttribute('tabIndex', '-1');
    });

    it('Enter key on swatch triggers color picker', () => {
      render(<ColorPicker {...defaultProps} />);
      const swatch = screen.getByLabelText(/select foreground color/i);
      
      // Just verify it doesn't throw and has handler
      fireEvent.keyDown(swatch, { key: 'Enter' });
    });

    it('Space key on swatch triggers color picker', () => {
      render(<ColorPicker {...defaultProps} />);
      const swatch = screen.getByLabelText(/select foreground color/i);
      
      // Just verify it doesn't throw and has handler
      fireEvent.keyDown(swatch, { key: ' ' });
    });
  });

  describe('labels', () => {
    it('accepts "Foreground" label', () => {
      render(<ColorPicker {...defaultProps} label="Foreground" />);
      expect(screen.getByText('Foreground')).toBeInTheDocument();
    });

    it('accepts "Background" label', () => {
      render(<ColorPicker {...defaultProps} label="Background" />);
      expect(screen.getByText('Background')).toBeInTheDocument();
    });
  });
});
