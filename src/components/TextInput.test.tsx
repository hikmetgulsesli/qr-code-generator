import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('renders the textarea with default placeholder', () => {
      render(<TextInput {...defaultProps} />);
      
      const textarea = screen.getByPlaceholderText('Enter URL or text to encode...');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('renders with custom placeholder', () => {
      render(<TextInput {...defaultProps} placeholder="Custom placeholder" />);
      
      const textarea = screen.getByPlaceholderText('Custom placeholder');
      expect(textarea).toBeInTheDocument();
    });

    it('renders with the provided value', () => {
      render(<TextInput {...defaultProps} value="Hello World" />);
      
      const textarea = screen.getByDisplayValue('Hello World');
      expect(textarea).toBeInTheDocument();
    });

    it('has correct aria attributes', () => {
      render(<TextInput {...defaultProps} />);
      
      const textarea = screen.getByLabelText('Text to encode');
      expect(textarea).toHaveAttribute('aria-describedby', 'text-input-counter');
    });

    it('applies custom className', () => {
      const { container } = render(<TextInput {...defaultProps} className="custom-class" />);
      
      const wrapper = container.querySelector('.text-input-wrapper');
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('change events', () => {
    it('calls onChange when text is entered', () => {
      const onChange = vi.fn();
      render(<TextInput value="" onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      
      expect(onChange).toHaveBeenCalledWith('Hello');
    });

    it('calls onChange with updated value', () => {
      const onChange = vi.fn();
      const { rerender } = render(<TextInput value="" onChange={onChange} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'https://example.com' } });
      
      expect(onChange).toHaveBeenCalledWith('https://example.com');
      
      rerender(<TextInput value="https://example.com" onChange={onChange} />);
      expect(textarea).toHaveValue('https://example.com');
    });

    it('respects maxLength prop', () => {
      const onChange = vi.fn();
      render(<TextInput value="" onChange={onChange} maxLength={10} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'This is a very long text' } });
      
      // onChange should not be called because text exceeds maxLength
      expect(onChange).not.toHaveBeenCalled();
    });

    it('allows text within maxLength', () => {
      const onChange = vi.fn();
      render(<TextInput value="" onChange={onChange} maxLength={20} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Short text' } });
      
      expect(onChange).toHaveBeenCalledWith('Short text');
    });
  });

  describe('clear button', () => {
    it('does not show clear button when value is empty', () => {
      render(<TextInput {...defaultProps} value="" />);
      
      const clearButton = screen.queryByLabelText('Clear text');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('shows clear button when text is present', () => {
      render(<TextInput {...defaultProps} value="Some text" />);
      
      const clearButton = screen.getByLabelText('Clear text');
      expect(clearButton).toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
      render(<TextInput {...defaultProps} value="Some text" disabled />);
      
      const clearButton = screen.queryByLabelText('Clear text');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('clears text when clear button is clicked', () => {
      const onChange = vi.fn();
      render(<TextInput value="Some text" onChange={onChange} />);
      
      const clearButton = screen.getByLabelText('Clear text');
      fireEvent.click(clearButton);
      
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('clear button is keyboard accessible', () => {
      render(<TextInput {...defaultProps} value="Some text" />);
      
      const clearButton = screen.getByLabelText('Clear text');
      expect(clearButton).toHaveAttribute('type', 'button');
    });
  });

  describe('character counter', () => {
    it('displays current character count', () => {
      render(<TextInput {...defaultProps} value="Hello" maxLength={100} />);
      
      const counter = screen.getByText('5 / 100');
      expect(counter).toBeInTheDocument();
    });

    it('displays count without max when maxLength not provided', () => {
      render(<TextInput {...defaultProps} value="Hello" />);
      
      const counter = screen.getByText('5');
      expect(counter).toBeInTheDocument();
    });

    it('shows zero when value is empty', () => {
      render(<TextInput {...defaultProps} value="" maxLength={100} />);
      
      const counter = screen.getByText('0 / 100');
      expect(counter).toBeInTheDocument();
    });

    it('applies near-limit class when approaching max', () => {
      render(<TextInput {...defaultProps} value={'a'.repeat(91)} maxLength={100} />);
      
      const counter = screen.getByText('91 / 100');
      expect(counter).toHaveClass('near-limit');
    });

    it('applies at-limit class when at max', () => {
      render(<TextInput {...defaultProps} value={'a'.repeat(100)} maxLength={100} />);
      
      const counter = screen.getByText('100 / 100');
      expect(counter).toHaveClass('at-limit');
    });

    it('has aria-live for screen reader announcements', () => {
      render(<TextInput {...defaultProps} value="Hello" maxLength={100} />);
      
      const counter = screen.getByText('5 / 100');
      expect(counter).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('disabled state', () => {
    it('disables the textarea when disabled prop is true', () => {
      render(<TextInput {...defaultProps} disabled />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('does not call onChange when disabled', () => {
      const onChange = vi.fn();
      render(<TextInput value="" onChange={onChange} disabled />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('focus and accessibility', () => {
    it('textarea is focusable', () => {
      render(<TextInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      textarea.focus();
      expect(textarea).toHaveFocus();
    });

    it('clear button is focusable', () => {
      render(<TextInput {...defaultProps} value="Some text" />);
      
      const clearButton = screen.getByLabelText('Clear text');
      clearButton.focus();
      expect(clearButton).toHaveFocus();
    });

    it('textarea has correct rows attribute', () => {
      render(<TextInput {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '6');
    });
  });
});
