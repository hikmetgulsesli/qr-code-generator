import { render, screen, fireEvent, within } from '@testing-library/react';
import { HistoryList } from './HistoryList';
import type { QRHistoryItem } from '../hooks/useQRHistory';

/** Helper: create a mock history item */
function createMockItem(overrides: Partial<QRHistoryItem> = {}): QRHistoryItem {
  return {
    id: `test-${Date.now()}-${Math.random()}`,
    text: 'https://example.com',
    foregroundColor: '#22d3ee',
    backgroundColor: '#18181b',
    size: 256,
    margin: 2,
    timestamp: '2025-02-15T06:00:00.000Z',
    ...overrides,
  };
}

const mockRestore = vi.fn();
const mockClear = vi.fn();

describe('HistoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state', () => {
    it('shows empty message when no items', () => {
      render(
        <HistoryList items={[]} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(
        screen.getByText('No history yet. Generate a QR code to see it here.')
      ).toBeInTheDocument();
    });

    it('has empty class when no items', () => {
      render(
        <HistoryList items={[]} onRestore={mockRestore} onClear={mockClear} />
      );

      const container = screen.getByTestId('history-list');
      expect(container).toHaveClass('history-list--empty');
    });

    it('does not show clear button when empty', () => {
      render(
        <HistoryList items={[]} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(
        screen.queryByRole('button', { name: /clear all/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('rendering items', () => {
    it('renders all history items', () => {
      const items = [
        createMockItem({ id: '1', text: 'First URL' }),
        createMockItem({ id: '2', text: 'Second URL' }),
        createMockItem({ id: '3', text: 'Third URL' }),
      ];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(screen.getByText('First URL')).toBeInTheDocument();
      expect(screen.getByText('Second URL')).toBeInTheDocument();
      expect(screen.getByText('Third URL')).toBeInTheDocument();
    });

    it('displays item count', () => {
      const items = [
        createMockItem({ id: '1' }),
        createMockItem({ id: '2' }),
      ];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(screen.getByText('2 items')).toBeInTheDocument();
    });

    it('displays singular "item" for one item', () => {
      const items = [createMockItem({ id: '1' })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(screen.getByText('1 item')).toBeInTheDocument();
    });

    it('displays timestamp for each item', () => {
      const items = [
        createMockItem({
          id: '1',
          text: 'test item',
          timestamp: new Date().toISOString(),
        }),
      ];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      // Should show relative time
      const timeElement = screen.getByRole('list').querySelector('time');
      expect(timeElement).toBeInTheDocument();
      expect(timeElement?.getAttribute('dateTime')).toBeTruthy();
    });

    it('displays color swatches for each item', () => {
      const items = [
        createMockItem({
          id: '1',
          foregroundColor: '#ff0000',
          backgroundColor: '#00ff00',
        }),
      ];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      const fgSwatch = screen.getByLabelText('Foreground: #ff0000');
      const bgSwatch = screen.getByLabelText('Background: #00ff00');
      expect(fgSwatch).toBeInTheDocument();
      expect(bgSwatch).toBeInTheDocument();
    });

    it('displays size for each item', () => {
      const items = [createMockItem({ id: '1', size: 512 })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(screen.getByText('512px')).toBeInTheDocument();
    });

    it('truncates long text', () => {
      const longText = 'a'.repeat(60);
      const items = [createMockItem({ id: '1', text: longText })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(screen.getByText(`${'a'.repeat(40)}...`)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const items = [createMockItem({ id: '1' })];

      render(
        <HistoryList
          items={items}
          onRestore={mockRestore}
          onClear={mockClear}
          className="custom-class"
        />
      );

      expect(screen.getByTestId('history-list')).toHaveClass('custom-class');
    });

    it('has proper list structure', () => {
      const items = [createMockItem({ id: '1' }), createMockItem({ id: '2' })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      const list = screen.getByRole('list', { name: 'QR code history' });
      expect(list).toBeInTheDocument();

      const listItems = within(list).getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('restore interaction', () => {
    it('calls onRestore when item is clicked', () => {
      const item = createMockItem({ id: '1', text: 'click me' });

      render(
        <HistoryList items={[item]} onRestore={mockRestore} onClear={mockClear} />
      );

      const restoreBtn = screen.getByRole('button', {
        name: /restore qr code/i,
      });
      fireEvent.click(restoreBtn);

      expect(mockRestore).toHaveBeenCalledTimes(1);
      expect(mockRestore).toHaveBeenCalledWith(item);
    });

    it('passes the full item object on restore', () => {
      const item = createMockItem({
        id: 'full-item',
        text: 'full restore',
        foregroundColor: '#aabbcc',
        backgroundColor: '#112233',
        size: 384,
        margin: 3,
      });

      render(
        <HistoryList items={[item]} onRestore={mockRestore} onClear={mockClear} />
      );

      const restoreBtn = screen.getByRole('button', {
        name: /restore qr code/i,
      });
      fireEvent.click(restoreBtn);

      const calledWith = mockRestore.mock.calls[0][0] as QRHistoryItem;
      expect(calledWith.text).toBe('full restore');
      expect(calledWith.foregroundColor).toBe('#aabbcc');
      expect(calledWith.backgroundColor).toBe('#112233');
      expect(calledWith.size).toBe(384);
      expect(calledWith.margin).toBe(3);
    });

    it('each item button is keyboard accessible', () => {
      const items = [createMockItem({ id: '1' })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      const restoreBtn = screen.getByRole('button', {
        name: /restore qr code/i,
      });
      expect(restoreBtn.tagName).toBe('BUTTON');
      expect(restoreBtn).not.toBeDisabled();
    });
  });

  describe('clear history', () => {
    it('shows clear all button when items exist', () => {
      const items = [createMockItem({ id: '1' })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      expect(
        screen.getByRole('button', { name: /clear all history/i })
      ).toBeInTheDocument();
    });

    it('calls onClear when clear button is clicked', () => {
      const items = [createMockItem({ id: '1' })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      const clearBtn = screen.getByRole('button', { name: /clear all history/i });
      fireEvent.click(clearBtn);

      expect(mockClear).toHaveBeenCalledTimes(1);
    });

    it('clear button is keyboard accessible', () => {
      const items = [createMockItem({ id: '1' })];

      render(
        <HistoryList items={items} onRestore={mockRestore} onClear={mockClear} />
      );

      const clearBtn = screen.getByRole('button', { name: /clear all history/i });
      expect(clearBtn.tagName).toBe('BUTTON');
    });
  });
});
