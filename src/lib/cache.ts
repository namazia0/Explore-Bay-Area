interface Entry<T> {
  value: T;
  expires: number;
}

/**
 * Process-local TTL cache. Apify runs cost money per result, so every live
 * fetch is memoised — a page reload must never trigger a second billed run.
 */
export class TTLCache<T> {
  private store = new Map<string, Entry<T>>();

  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expires) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T): void {
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
    if (this.store.size > 200) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}
