import { it, expect, describe, beforeEach } from "bun:test";

import { NoCache, SimpleCache } from "./cache";
import { TokenType, type LexerCache, type Token } from "./types";

describe("NoCache", () => {
  it("should not store any data in the cache", () => {
    const cache: LexerCache = new NoCache();
    cache.add(0, { type: TokenType.Hash, literal: "#" });

    let got = cache.get(0);
    expect(got).toBeNull();

    cache.add(8, { type: TokenType.Space, literal: " " });
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

  describe("get and set", () => {
    it("should store and retrieve data in the cache", () => {
      const token: Token = { type: TokenType.Hash, literal: "#" };
      cache.add(0, token);
      const got = cache.get(0);
      expect(got).toEqual(token);
    });

    it.todo("should overwrite the value at that position if it already exists", () => {
      // TODO
    });
  });

  describe("insert", () => {
    it("should insert multiple tokens into the cache and shift affected items forward in the cache", () => {
      const tokens: Token[] = [
        { type: TokenType.Hash, literal: "#" },
        { type: TokenType.Space, literal: " " },
        { type: TokenType.Content, literal: "content1" },
      ];
      cache.insert(0, tokens);
      let got0 = cache.get(0);
      let got1 = cache.get(1);
      let got2 = cache.get(2);
      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[1]);
      expect(got2).toEqual(tokens[2]);

      const tokens2: Token[] = [
        { type: TokenType.Ampersand, literal: "&" },
        { type: TokenType.Content, literal: "content2" },
        { type: TokenType.Caret, literal: "^" },
        { type: TokenType.Dollar, literal: "$" },
      ];

      cache.insert(2, tokens2);

      got0 = cache.get(0);
      got1 = cache.get(1);
      got2 = cache.get(2);
      const got3 = cache.get(3);
      const got4 = cache.get(11);
      const got5 = cache.get(12);
      const got6 = cache.get(13);

      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[1]);
      expect(got2).toEqual(tokens2[0]);
      expect(got3).toEqual(tokens2[1]);
      expect(got4).toEqual(tokens2[2]);
      expect(got5).toEqual(tokens2[3]);
      expect(got6).toEqual(tokens[2]);
    });
  });

  describe("remove", () => {
    it("should remove data from the cache and shift affected items back in the cache", () => {
      const tokens: Token[] = [
        { type: TokenType.Hash, literal: "#" },
        { type: TokenType.Space, literal: " " },
        { type: TokenType.Content, literal: "content1" },
        { type: TokenType.Ampersand, literal: "&" },
        { type: TokenType.Content, literal: "content2" },
        { type: TokenType.Caret, literal: "^" },
        { type: TokenType.Dollar, literal: "$" },
      ];

      cache.insert(0, tokens);
      cache.remove(2, 10);

      const got0 = cache.get(0);
      const got1 = cache.get(1);
      const got2 = cache.get(2);
      const got3 = cache.get(10);
      const got4 = cache.get(11);
      const got5 = cache.get(12);

      expect(got0).toEqual(tokens[0]);
      expect(got1).toEqual(tokens[1]);
      expect(got2).toEqual(tokens[4]);
      expect(got3).toEqual(tokens[5]);
      expect(got4).toEqual(tokens[6]);
      expect(got5).toBeNull();
    });

    it.todo("should swap the start and end if the end is larger than the start", () => {
      // TODO
    });

    it.todo("should not alter the cache if the start and end are the same", () => {
      // TODO
    });
  });

  // it("should evict a portion of the cache", () => {
  //   const tokens: Token[] = [
  //     { type: TokenType.Hash, literal: "#" },
  //     { type: TokenType.Space, literal: " " },
  //   ];
  //   cache.insert(0, tokens);
  //   cache.evict(0, 0);
  //   const got = cache.get(0);
  //   expect(got).toBeNull();
  // });
});
