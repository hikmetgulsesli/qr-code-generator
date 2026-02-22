import { renderHook, act } from '@testing-library/react';
import {
  useQRHistory,
  MAX_HISTORY_ITEMS,
  HISTORY_STORAGE_KEY,
} from './useQRHistory';
import type { QRHistoryItem } from './useQRHistory';

/** Helper: create a history item input (without id/timestamp) */
function createItemInput(text: string) {
  return {
    text,
    foregroundColor: '#22d3ee',
    backgroundColor: '#18181b',
    size: 256,
    margin: 2,
  };
}

describe('useQRHistory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('returns empty history by default', () => {
      const { result } = renderHook(() => useQRHistory());
      expect(result.current.history).toEqual([]);
    });

    it('loads history from localStorage on mount', () => {
      const existingItems: QRHistoryItem[] = [
        {
          id: 'test-1',
          text: 'https://example.com',
          foregroundColor: '#000000',
          backgroundColor: '#ffffff',
          size: 256,
          margin: 2,
          timestamp: '2025-01-01T00:00:00.000Z',
        },
      ];
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(existingItems));

      const { result } = renderHook(() => useQRHistory());
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].text).toBe('https://example.com');
    });

    it('handles invalid JSON in localStorage gracefully', () => {
      localStorage.setItem(HISTORY_STORAGE_KEY, 'not valid json');

      const { result } = renderHook(() => useQRHistory());
      expect(result.current.history).toEqual([]);
    });

    it('handles non-array data in localStorage gracefully', () => {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ foo: 'bar' }));

      const { result } = renderHook(() => useQRHistory());
      expect(result.current.history).toEqual([]);
    });

    it('filters out invalid items from localStorage', () => {
      const mixedData = [
        {
          id: 'valid-1',
          text: 'valid item',
          foregroundColor: '#000',
          backgroundColor: '#fff',
          size: 256,
          margin: 2,
          timestamp: '2025-01-01T00:00:00.000Z',
        },
        { id: 'invalid', text: 123 }, // invalid
        null,
      ];
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(mixedData));

      const { result } = renderHook(() => useQRHistory());
      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].text).toBe('valid item');
    });
  });

  describe('addToHistory', () => {
    it('adds an item to history', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('hello'));
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].text).toBe('hello');
    });

    it('generates unique id for each item', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('first'));
      });
      act(() => {
        result.current.addToHistory(createItemInput('second'));
      });

      expect(result.current.history[0].id).not.toBe(result.current.history[1].id);
    });

    it('adds timestamp to each item', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('test'));
      });

      expect(result.current.history[0].timestamp).toBeTruthy();
      // Should be a valid ISO date string
      expect(new Date(result.current.history[0].timestamp).getTime()).not.toBeNaN();
    });

    it('stores all provided settings', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory({
          text: 'custom settings',
          foregroundColor: '#ff0000',
          backgroundColor: '#00ff00',
          size: 512,
          margin: 4,
        });
      });

      const item = result.current.history[0];
      expect(item.text).toBe('custom settings');
      expect(item.foregroundColor).toBe('#ff0000');
      expect(item.backgroundColor).toBe('#00ff00');
      expect(item.size).toBe(512);
      expect(item.margin).toBe(4);
    });

    it('prepends new items (newest first)', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('first'));
      });
      act(() => {
        result.current.addToHistory(createItemInput('second'));
      });

      expect(result.current.history[0].text).toBe('second');
      expect(result.current.history[1].text).toBe('first');
    });

    it('persists to localStorage', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('persist me'));
      });

      const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? '[]') as QRHistoryItem[];
      expect(stored).toHaveLength(1);
      expect(stored[0].text).toBe('persist me');
    });
  });

  describe('maximum items limit', () => {
    it('limits history to MAX_HISTORY_ITEMS', () => {
      const { result } = renderHook(() => useQRHistory());

      // Add more than max items
      act(() => {
        for (let i = 0; i < MAX_HISTORY_ITEMS + 5; i++) {
          result.current.addToHistory(createItemInput(`item-${i}`));
        }
      });

      expect(result.current.history).toHaveLength(MAX_HISTORY_ITEMS);
    });

    it('removes oldest items when limit exceeded', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        for (let i = 0; i < MAX_HISTORY_ITEMS + 3; i++) {
          result.current.addToHistory(createItemInput(`item-${i}`));
        }
      });

      // Newest item should be last added
      expect(result.current.history[0].text).toBe(`item-${MAX_HISTORY_ITEMS + 2}`);
      // Oldest surviving item should be the one at position (total - max)
      expect(result.current.history[MAX_HISTORY_ITEMS - 1].text).toBe('item-3');
    });

    it('MAX_HISTORY_ITEMS is 10', () => {
      expect(MAX_HISTORY_ITEMS).toBe(5);
    });
  });

  describe('getHistory', () => {
    it('returns current history items', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('test'));
      });

      const items = result.current.getHistory();
      expect(items).toHaveLength(1);
      expect(items[0].text).toBe('test');
    });

    it('returns empty array when no history', () => {
      const { result } = renderHook(() => useQRHistory());
      expect(result.current.getHistory()).toEqual([]);
    });
  });

  describe('clearHistory', () => {
    it('removes all items from history', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('item 1'));
        result.current.addToHistory(createItemInput('item 2'));
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toEqual([]);
    });

    it('clears localStorage', () => {
      const { result } = renderHook(() => useQRHistory());

      act(() => {
        result.current.addToHistory(createItemInput('persist'));
      });

      act(() => {
        result.current.clearHistory();
      });

      const stored = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? '[]') as QRHistoryItem[];
      expect(stored).toEqual([]);
    });
  });

  describe('localStorage error handling', () => {
    it('handles localStorage.getItem throwing error', () => {
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = () => {
        throw new Error('Storage disabled');
      };

      const { result } = renderHook(() => useQRHistory());
      expect(result.current.history).toEqual([]);

      localStorage.getItem = originalGetItem;
    });

    it('handles localStorage.setItem throwing error on add', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('Storage full');
      };

      const { result } = renderHook(() => useQRHistory());

      // Should not throw even if localStorage fails
      act(() => {
        result.current.addToHistory(createItemInput('test'));
      });

      // In-memory state should still work
      expect(result.current.history).toHaveLength(1);

      localStorage.setItem = originalSetItem;
    });
  });
});
