import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';

describe('Layout', () => {
  describe('render', () => {
    it('renders Layout component', () => {
      render(
        <Layout
          leftColumn={<div data-testid="left-content">Left Content</div>}
          rightColumn={<div data-testid="right-content">Right Content</div>}
        />
      );
      expect(screen.getByTestId('left-content')).toBeInTheDocument();
      expect(screen.getByTestId('right-content')).toBeInTheDocument();
    });

    it('renders header with QR Code Generator title', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
        />
      );
      expect(screen.getByText('QR Code Generator')).toBeInTheDocument();
    });

    it('renders QrCode icon in header', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
        />
      );
      // The icon is an SVG with aria-hidden
      const header = screen.getByRole('banner');
      expect(header.querySelector('svg')).toBeInTheDocument();
    });

    it('renders left column content', () => {
      render(
        <Layout
          leftColumn={<div data-testid="custom-left">Custom Left Content</div>}
          rightColumn={<div>Right</div>}
        />
      );
      expect(screen.getByTestId('custom-left')).toHaveTextContent('Custom Left Content');
    });

    it('renders right column content', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div data-testid="custom-right">Custom Right Content</div>}
        />
      );
      expect(screen.getByTestId('custom-right')).toHaveTextContent('Custom Right Content');
    });

    it('applies custom className', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
          className="custom-layout-class"
        />
      );
      expect(screen.getByRole('banner').parentElement).toHaveClass('custom-layout-class');
    });

    it('has correct semantic structure with header and main', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
        />
      );
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has aria-labels for columns', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
        />
      );
      expect(screen.getByLabelText('Input and controls')).toBeInTheDocument();
      expect(screen.getByLabelText('QR code display')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('renders grid container with correct class', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
        />
      );
      const main = screen.getByRole('main');
      const grid = main.querySelector('.layout-grid');
      expect(grid).toBeInTheDocument();
    });

    it('renders both columns in grid', () => {
      render(
        <Layout
          leftColumn={<div data-testid="left-col">Left</div>}
          rightColumn={<div data-testid="right-col">Right</div>}
        />
      );
      const leftSection = screen.getByLabelText('Input and controls');
      const rightSection = screen.getByLabelText('QR code display');
      
      expect(leftSection).toHaveClass('layout-left-column');
      expect(rightSection).toHaveClass('layout-right-column');
    });
  });

  describe('dark theme', () => {
    it('applies dark background color to layout', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
        />
      );
      const layout = screen.getByRole('banner').parentElement;
      expect(layout).toHaveClass('layout');
    });

    it('applies dark background to header', () => {
      render(
        <Layout
          leftColumn={<div>Left</div>}
          rightColumn={<div>Right</div>}
        />
      );
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('layout-header');
    });
  });
});
