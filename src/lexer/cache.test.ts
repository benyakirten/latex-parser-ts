import { beforeEach, describe, expect, it } from "bun:test";

import { NoCache, SimpleCache } from "./cache";
import {
  LatexAccentType,
  type LatexToken,
  LatexTokenType,
  type LexerCache,
} from "./types";

describe("NoCache", () => {
  it("should not store any data in the cache", () => {
    const cache: LexerCache = new NoCache();
    cache.add(0, { type: LatexTokenType.ColumnAlign, literal: "&" });

    let got = cache.get(0);
    expect(got).toBeNull();

    cache.add(8, {
      type: LatexTokenType.Accent,
      literal: "\\^h",
      detail: LatexAccentType.Circumflex,
      content: {
        type: LatexTokenType.Content,
        originalLength: 1,
        literal: "h",
      },
    });
    cache.remove(0, 8);
    got = cache.get(0);
    expect(got).toBeNull();
  });
});

describe("SimpleCache", () => {
  let cache: LexerCache;

  beforeEach(() => {
    cache = new SimpleCache();
  });

  const tokens: LatexToken[] = [
    {
      type: LatexTokenType.Command,
      literal: "\\mycommand",
      name: "mycommand",
      arguments: [],
    },
    { type: LatexTokenType.ColumnAlign, literal: "&" },
    { type: LatexTokenType.Content, literal: " content1 ", originalLength: 10 },
    {
      type: LatexTokenType.Accent,
      literal: "\\^h",
      detail: LatexAccentType.Circumflex,
      content: {
        type: LatexTokenType.Content,
        originalLength: 1,
        literal: "h",
      },
    },
  ];

  describe("get and set", () => {
    it("should store and retrieve data in the cache", () => {
      const token: LatexToken = {
        type: LatexTokenType.ColumnAlign,
        literal: "&",
      };
      cache.add(0, token);
      const got = cache.get(0);
      expect(got).toEqual(token);
    });

    it("should overwrite the value at that position if it already exists", () => {
      const token1: LatexToken = {
        type: LatexTokenType.Content,
        literal: " content1 ",
        originalLength: 10,
      };
      cache.add(0, token1);

      const token2: LatexToken = {
        type: LatexTokenType.ColumnAlign,
        literal: "&",
      };
      cache.add(0, token2);

      const got = cache.get(0);
      expect(got).toEqual(token2);
    });
  });

  describe("insert", () => {
    it("should insert multiple tokens into the cache and shift affected items forward in the cache", () => {
      cache.insert(0, tokens.slice(0, 2));
      let got0 = cache.get(0);
      let got1 = cache.get(10);

      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[1]);

      cache.insert(10, tokens.slice(2));
      got0 = cache.get(0);
      got1 = cache.get(10);
      const got2 = cache.get(20);
      const got3 = cache.get(23);

      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[2]);
      expect(got2).toEqual(tokens[3]);
      expect(got3).toEqual(tokens[1]);
    });
  });

  describe("remove", () => {
    it("should remove data from the cache and shift affected items back in the cache", () => {
      cache.insert(0, tokens);
      cache.remove(10, 11);

      const got0 = cache.get(0);
      const got1 = cache.get(11);
      const got2 = cache.get(19);

      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[2]);
      expect(got2).toEqual(tokens[3]);
    });

    it("should swap the start and end if the end is larger than the start", () => {
      cache.insert(0, tokens);
      cache.remove(11, 10);

      const got0 = cache.get(0);
      const got1 = cache.get(11);
      const got2 = cache.get(19);

      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[2]);
      expect(got2).toEqual(tokens[3]);
    });

    it("should not alter the cache if the start and end are the same", () => {
      cache.insert(0, tokens);
      cache.remove(10, 10);

      const got0 = cache.get(0);
      const got1 = cache.get(10);
      const got2 = cache.get(11);
      const got3 = cache.get(21);

      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[1]);
      expect(got2).toEqual(tokens[2]);
      expect(got3).toEqual(tokens[3]);
    });

    describe("evict", () => {
      it("should remove a portion of the cache without offsetting any items that were not removed", () => {
        cache.insert(0, tokens);
        cache.evict(10, 11);

        const got0 = cache.get(0);
        const got2 = cache.get(11);
        const got3 = cache.get(21);

        expect(got0).toEqual(tokens[0]);
        expect(got2).toEqual(tokens[2]);
        expect(got3).toEqual(tokens[3]);
      });
    });
  });
});
