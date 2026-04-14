import { useCallback } from 'react';

const KEY = 'recently-viewed';
const MAX = 6;

export function useRecentlyViewed() {
  const get = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  };

  const add = useCallback((productId: string) => {
    const current = get().filter(id => id !== productId);
    const updated = [productId, ...current].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  }, []);

  return { getIds: get, add };
}
