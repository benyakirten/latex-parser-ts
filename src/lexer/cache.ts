import type { LexerCache, LatexToken } from "./types";

/**
 * A simple caching behavior that stores by their position.
 * A LRU cache would be better for large documents, but I'll have to run
 * tests to see where the breakpoint is.
 */
export class SimpleCache implements LexerCache {
  #cache: Map<number, LatexToken>;

  constructor(cache?: Map<number, LatexToken>) {
    this.#cache = cache ?? new Map();
  }

  /**
   * Evict a portion of the cache if needed to reduce memory usage.
   * NOTE: Need performance tests to measure when this is needed.
   */
  evict(start: number, end: number): LexerCache {
    for (const p of this.#cache.keys()) {
      if (p >= start && p < end) {
        this.#cache.delete(p);
      }
    }

    return this;
  }

  public add(position: number, token: LatexToken): LexerCache {
    this.#cache.set(position, token);
    return this;
  }

  public insert(position: number, tokens: LatexToken[]): LexerCache {
    let offset = 0;
    const movedEntries: [number, LatexToken][] = [];

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

    // If we removed 2-10, we want to shift item in slot 11 to 2, which is 10 - 2 + 1
    const offset = end - start + 1;
    const itemsToShift: [number, LatexToken][] = [];
    for (const [p, t] of this.#cache.entries()) {
      if (p > end) {
        // Store the items to shift so we don't mutate the map while iterating through it (quirk of JavaScript).
        itemsToShift.push([p - offset, t]);
        // Remove up to the designated position.
      } else if (p >= start && p < end) {
        this.#cache.delete(p);
      }
    }

    for (const [p, t] of itemsToShift) {
      this.#cache.set(p, t);
    }

    return this;
  }

  public get(position: number): LatexToken | null {
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
  get(): LatexToken | null {
    return null;
  }
}
