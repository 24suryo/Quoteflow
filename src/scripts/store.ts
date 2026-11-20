export interface UserPreferences {
  locale: 'en' | 'id';
  lastCategoryId: string;
}

export interface HistoryEntry {
  quoteId: string;
  viewedAt: string;
}

const KEYS = {
  favorites: 'quoteflow_favorites_v1',
  history: 'quoteflow_history_v1',
  prefs: 'quoteflow_prefs_v1',
} as const;

const MAX_HISTORY = 20;

function canUseStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

export function getFavorites(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEYS.favorites);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function isFavorite(quoteId: string): boolean {
  return getFavorites().includes(quoteId);
}

export function toggleFavorite(quoteId: string): { favorited: boolean; favorites: string[] } {
  const current = getFavorites();
  const exists = current.includes(quoteId);
  const next = exists ? current.filter((id) => id !== quoteId) : [quoteId, ...current];

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KEYS.favorites, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('quoteflow:favorites-changed', { detail: { favorites: next } }));
    } catch {
      // Ignore quota errors
    }
  }

  return { favorited: !exists, favorites: next };
}

export function getHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEYS.history);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function recordViewedQuote(quoteId: string): HistoryEntry[] {
  const current = getHistory().filter((entry) => entry.quoteId !== quoteId);
  const next: HistoryEntry[] = [
    { quoteId, viewedAt: new Date().toISOString() },
    ...current,
  ].slice(0, MAX_HISTORY);

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KEYS.history, JSON.stringify(next));
    } catch {
      // Ignore storage quota errors
    }
  }

  return next;
}

export function getPreferences(): UserPreferences {
  if (!canUseStorage()) return { locale: 'en', lastCategoryId: 'all' };
  try {
    const raw = window.localStorage.getItem(KEYS.prefs);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      locale: parsed?.locale === 'id' ? 'id' : 'en',
      lastCategoryId: typeof parsed?.lastCategoryId === 'string' ? parsed.lastCategoryId : 'all',
    };
  } catch {
    return { locale: 'en', lastCategoryId: 'all' };
  }
}

export function savePreferences(partial: Partial<UserPreferences>): UserPreferences {
  const updated: UserPreferences = { ...getPreferences(), ...partial };
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KEYS.prefs, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  }
  return updated;
}