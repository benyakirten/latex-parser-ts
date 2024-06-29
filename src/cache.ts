import type { LexerCache, Token } from "./types";

/**
 * A simple caching behavior that stores by their position.
 * A LRU cache would be better for large documents, but I'll have to run
 * tests to see where the breakpoint is.
 */
export class SimpleCache implements LexerCache {
  private _cache: Map<number, Token>;

  constructor(cache?: Map<number, Token>) {
    this._cache = cache ?? new Map();
  }

  /**
   * Evict a portion of the cache if needed to reduce memory usage.
   * NOTE: Need performance tests to measure when this is needed.
   */
  evict(start: number, end: number): LexerCache {
    for (const p of this._cache.keys()) {
      if (p >= start && p <= end) {
        this._cache.delete(p);
      }
    }

    return this;
  }

  public add(position: number, token: Token): LexerCache {
    this._cache.set(position, token);
    return this;
  }

  public insert(position: number, tokens: Token[]): LexerCache {
    let offset = position;
    const entries: [number, Token][] = [];

    for (const [p, t] of this._cache.entries()) {
      if (p >= position) {
        entries.push([p, t]);
      }
    }

    for (const token of tokens) {
      this._cache.set(offset, token);
      offset += token.literal.length;
    }

    for (const [p, t] of entries) {
      this._cache.set(offset + p, t);
    }

    return this;
  }

  public remove(start: number, end: number): LexerCache {
    if (start === end) {
      return this;
    }

    // We could enforce start < end, but we can just swap the variables.
    if (start > end) {
      [start, end] = [end, start];
    }

    const offset = end - start;
    for (const [p, t] of this._cache.entries()) {
      if (p < start) {
        continue;
      }

      if (p >= start && p <= end) {
        this._cache.delete(p);
        continue;
      }

      this._cache.set(p - offset, t);
    }

    return this;
  }

  public get(position: number): Token | null {
    return this._cache.get(position) ?? null;
  }
}

export class NoCache implements LexerCache {
  evict(): LexerCache {
    return this;
  }
  add(): LexerCache {
    return this;
  }
  insert(): LexerCache {
    return this;
  }
  remove(): LexerCache {
    return this;
  }
  get(): Token | null {
    return null;
  }
}
