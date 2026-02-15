/**
 * QR History hook for managing previously generated QR codes
 * Persists history to localStorage with a maximum of 10 items
 */

import { useState, useCallback } from 'react';

/** Maximum number of history items to keep */
const MAX_HISTORY_ITEMS = 10;

/** localStorage key for history persistence */
const HISTORY_STORAGE_KEY = 'qr-history';

/**
 * A single history entry representing a generated QR code
 */
export interface QRHistoryItem {
  /** Unique identifier */
  id: string;
  /** Text/URL that was encoded */
  text: string;
  /** Foreground color (hex) */
  foregroundColor: string;
  /** Background color (hex) */
  backgroundColor: string;
  /** QR code size in pixels */
  size: number;
  /** Margin around QR code */
  margin: number;
  /** ISO timestamp when the QR code was generated */
  timestamp: string;
}

/**
 * Actions returned by the useQRHistory hook
 */
export interface QRHistoryActions {
  /** Current history items (newest first) */
  history: QRHistoryItem[];
  /** Add a new item to history */
  addToHistory: (item: Omit<QRHistoryItem, 'id' | 'timestamp'>) => void;
  /** Get all history items */
  getHistory: () => QRHistoryItem[];
  /** Clear all history */
  clearHistory: () => void;
}

/**
 * Generates a unique ID for history items
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Safely loads history from localStorage
 * Returns empty array if loading fails or data is invalid
 */
function loadHistoryFromStorage(): QRHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    // Validate each item has the required fields
    const validItems = parsed.filter((item: unknown): item is QRHistoryItem => {
      if (typeof item !== 'object' || item === null) return false;
      const record = item as Record<string, unknown>;
      return (
        typeof record.id === 'string' &&
        typeof record.text === 'string' &&
        typeof record.foregroundColor === 'string' &&
        typeof record.backgroundColor === 'string' &&
        typeof record.size === 'number' &&
        typeof record.margin === 'number' &&
        typeof record.timestamp === 'string'
      );
    });

    return validItems.slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

/**
 * Safely saves history to localStorage
 * Silently fails on error
 */
function saveHistoryToStorage(history: QRHistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage might be disabled, full, or in private mode
  }
}

/**
 * Custom hook for managing QR code generation history with localStorage persistence
 *
 * @returns History items and action functions (add, get, clear)
 */
export function useQRHistory(): QRHistoryActions {
  const [history, setHistory] = useState<QRHistoryItem[]>(() =>
    loadHistoryFromStorage()
  );

  const addToHistory = useCallback(
    (item: Omit<QRHistoryItem, 'id' | 'timestamp'>) => {
      setHistory((prev) => {
        const newItem: QRHistoryItem = {
          ...item,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        // Prepend new item and limit to MAX_HISTORY_ITEMS
        const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
        saveHistoryToStorage(updated);
        return updated;
      });
    },
    []
  );

  const getHistory = useCallback((): QRHistoryItem[] => {
    return history;
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistoryToStorage([]);
  }, []);

  return {
    history,
    addToHistory,
    getHistory,
    clearHistory,
  };
}

export { MAX_HISTORY_ITEMS, HISTORY_STORAGE_KEY };
