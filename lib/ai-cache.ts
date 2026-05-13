import type { AIAnalysis, ComparisonResult } from './types';

const CACHE_KEY_PREFIX = 'dca-ai-cache:';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

function hashInput(result: ComparisonResult): string {
  const key = JSON.stringify({
    s: [...result.input.strategies].sort(),
    a: result.input.monthlyAmount,
    f:
      result.input.startDate instanceof Date
        ? result.input.startDate.toISOString().slice(0, 7)
        : String(result.input.startDate),
    t:
      result.input.endDate instanceof Date
        ? result.input.endDate.toISOString().slice(0, 7)
        : String(result.input.endDate),
  });
  return btoa(unescape(encodeURIComponent(key))).slice(0, 32);
}

export function getCachedAnalysis(result: ComparisonResult): AIAnalysis | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + hashInput(result));
    if (!raw) return null;
    const cached = JSON.parse(raw) as AIAnalysis & { cachedAt: number };
    if (Date.now() - cached.cachedAt > TTL_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + hashInput(result));
      return null;
    }
    return { ...cached, fromCache: true };
  } catch {
    return null;
  }
}

export function setCachedAnalysis(result: ComparisonResult, analysis: AIAnalysis): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + hashInput(result),
      JSON.stringify({ ...analysis, cachedAt: Date.now() })
    );
  } catch {
    // abaikan localStorage quota errors
  }
}

export function clearAICache(): void {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(CACHE_KEY_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
