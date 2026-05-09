const TTL_MS = 24 * 60 * 60 * 1000

interface CacheEntry<T> {
  data: T
  fetchedAt: number
  ttl: number
}

export function getCached<T>(key: string, ttlMs: number = TTL_MS): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`htc_${key}`)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.fetchedAt > ttlMs) {
      localStorage.removeItem(`htc_${key}`)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCached<T>(key: string, data: T, ttlMs: number = TTL_MS): void {
  if (typeof window === 'undefined') return
  try {
    const entry: CacheEntry<T> = { data, fetchedAt: Date.now(), ttl: ttlMs }
    localStorage.setItem(`htc_${key}`, JSON.stringify(entry))
  } catch {
    // Storage quota exceeded — clear old entries
    clearOldCache()
  }
}

export function clearOldCache(): void {
  if (typeof window === 'undefined') return
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith('htc_')) keys.push(k)
  }
  // Remove oldest half
  keys.slice(0, Math.floor(keys.length / 2)).forEach(k => localStorage.removeItem(k))
}
