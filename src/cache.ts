import type { LexerCache, Token } from "./types";

/**
 * A simple caching behavior that stores by their position.
 * A LRU cache would be better for large documents, but I'll have to run
 * tests to see where the breakpoint is.
 */
export class SimpleCache implements LexerCache {
  #cache: Map<number, Token>;

  constructor(cache?: Map<number, Token>) {
    this.#cache = cache ?? new Map();
  }

  /**
   * Evict a portion of the cache if needed to reduce memory usage.
   * NOTE: Need performance tests to measure when this is needed.
   */
  evict(start: number, end: number): LexerCache {
    for (const p of this.#cache.keys()) {
      if (p >= start && p <= end) {
        this.#cache.delete(p);
      }
    }

    return this;
  }

  public add(position: number, token: Token): LexerCache {
    this.#cache.set(position, token);
    return this;
  }

  public insert(position: number, tokens: Token[]): LexerCache {
    let offset = 0;
    const movedEntries: [number, Token][] = [];

    for (const [p, t] of this.#cache.entries()) {
      if (p >= position) {
        movedEntries.push([p, t]);
      }
    }

    for (const token of tokens) {
      this.#cache.set(position + offset, token);
      offset += token.literal.length;
    }

    for (const [p, t] of movedEntries) {
      this.#cache.set(offset + p, t);
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
    for (const [p, t] of this.#cache.entries()) {
      if (p < start) {
        continue;
      }

      if (p >= start && p <= end) {
        this.#cache.delete(p);
        continue;
      }

      this.#cache.set(p - offset, t);
    }

    return this;
  }

  public get(position: number): Token | null {
    return this.#cache.get(position) ?? null;
  }
}

export class NoCache implements LexerCache {
  evict(): LexerCache {
    return this;
  }
  add() {
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
