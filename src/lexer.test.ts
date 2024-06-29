import { it, expect, describe, beforeEach, jest } from "bun:test";

import { LatexLexer } from "./lexer";
import { TokenType, type LexerCache, type Token } from "./types";

const FULL_LATEX_DOC = `\\documentclass[12pt]{article}
\\( E = mc^2 \\). And here is a displayed equation:
\\[
\\int_a^b f(x)\\,dx
\\]
\\\tbegin{figure:sample}[h]
\\includegraphics[width=0.5\\textwidth]{example.jpg}`;

const SHORT_LATEX_DOC = `\\documentclass[12pt]{article}`;

describe("LatexLexer", () => {
  let lexer: LatexLexer;
  beforeEach(() => {
    lexer = new LatexLexer(SHORT_LATEX_DOC);
  });

  it("should correctly lex a latex document", () => {
    const lexer = new LatexLexer(FULL_LATEX_DOC);

    const want: Token[] = [
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.Content, literal: "documentclass" },
      { type: TokenType.LBracket, literal: "[" },
      { type: TokenType.Content, literal: "12pt" },
      { type: TokenType.RBracket, literal: "]" },
      { type: TokenType.LBrace, literal: "{" },
      { type: TokenType.Content, literal: "article" },
      { type: TokenType.RBrace, literal: "}" },
      { type: TokenType.EndOfLine, literal: "\n" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.LParen, literal: "(" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "E" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "=" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "mc" },
      { type: TokenType.Caret, literal: "^" },
      { type: TokenType.Content, literal: "2" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.RParen, literal: ")" },
      { type: TokenType.Content, literal: "." },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "And" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "here" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "is" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "a" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "displayed" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "equation:" },
      { type: TokenType.EndOfLine, literal: "\n" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.LBracket, literal: "[" },
      { type: TokenType.EndOfLine, literal: "\n" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.Content, literal: "int" },
      { type: TokenType.Underscore, literal: "_" },
      { type: TokenType.Content, literal: "a" },
      { type: TokenType.Caret, literal: "^" },
      { type: TokenType.Content, literal: "b" },
      { type: TokenType.Space, literal: " " },
      { type: TokenType.Content, literal: "f" },
      { type: TokenType.LParen, literal: "(" },
      { type: TokenType.Content, literal: "x" },
      { type: TokenType.RParen, literal: ")" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.Content, literal: ",dx" },
      { type: TokenType.EndOfLine, literal: "\n" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.RBracket, literal: "]" },
      { type: TokenType.EndOfLine, literal: "\n" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.Tab, literal: "\t" },
      { type: TokenType.Content, literal: "begin" },
      { type: TokenType.LBrace, literal: "{" },
      { type: TokenType.Content, literal: "figure:sample" },
      { type: TokenType.RBrace, literal: "}" },
      { type: TokenType.LBracket, literal: "[" },
      { type: TokenType.Content, literal: "h" },
      { type: TokenType.RBracket, literal: "]" },
      { type: TokenType.EndOfLine, literal: "\n" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.Content, literal: "includegraphics" },
      { type: TokenType.LBracket, literal: "[" },
      { type: TokenType.Content, literal: "width=0.5" },
      { type: TokenType.BackSlash, literal: "\\" },
      { type: TokenType.Content, literal: "textwidth" },
      { type: TokenType.RBracket, literal: "]" },
      { type: TokenType.LBrace, literal: "{" },
      { type: TokenType.Content, literal: "example.jpg" },
      { type: TokenType.RBrace, literal: "}" },
    ];
    const got = [...lexer];

    expect(got).toEqual(want);
  });

  describe("seek", () => {
    it("should correctly set the position based off the seek method", () => {
      lexer.seek(1);
      let got = lexer.nextToken();
      expect(got).toEqual({ type: TokenType.Content, literal: "documentclass" });

      lexer.seek(0);
      got = lexer.nextToken();
      expect(got).toEqual({ type: TokenType.BackSlash, literal: "\\" });

      lexer.seek(30);
      got = lexer.nextToken();
      expect(got).toEqual({ type: TokenType.EOF, literal: "" });
    });

    it("if the seek value is less than 0 then it should set the position to the end minus the distance parameter", () => {
      lexer.seek(-8);
      let got = lexer.nextToken();
      expect(got).toEqual({ type: TokenType.Content, literal: "article" });

      lexer.seek(-8);
      got = lexer.nextToken();
      expect(got).toEqual({ type: TokenType.Content, literal: "article" });
    });

    it("should set the read position to the beginning of the document if the seek position is a negative number greater than the document's length", () => {
      lexer.seek(-10000);
      const got = lexer.nextToken();
      expect(got).toEqual({ type: TokenType.BackSlash, literal: "\\" });
    });

    it("should set the position to the end of the document if the seek position is longer than the document's length", () => {
      lexer.seek(1000000);
      const got = lexer.nextToken();
      expect(got).toEqual({ type: TokenType.EOF, literal: "" });
    });
  });

  describe("insert", () => {
    it("should insert items into the lexer's input", () => {
      lexer.insert(1, "somecommand\\");

      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "somecommand" },
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "documentclass" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
      ];

      expect(got).toEqual(want);
    });

    it("should insert by distance from the end if the position is negative", () => {
      lexer.insert(-1, "fast:introduction");

      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "documentclass" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "articlefast:introduction" },
        { type: TokenType.RBrace, literal: "}" },
      ];

      expect(got).toEqual(want);
    });

    it("should insert at the beginning for a sufficiently large negative value", () => {
      lexer.insert(-10000, "\\somecommand");

      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "somecommand" },
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "documentclass" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
      ];
      expect(got).toEqual(want);
    });

    it("should insert at the end for a sufficiently large positive value", () => {
      lexer.insert(1000, "$");

      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "documentclass" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
        { type: TokenType.Dollar, literal: "$" },
      ];

      expect(got).toEqual(want);
    });
  });

  describe("remove", () => {
    it("should remove the segment from the lexer's input", () => {
      lexer.remove(1, 9);
      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "class" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
      ];

      expect(got).toEqual(want);
    });

    it("should remove the segment from the lexer's input when the start value is negative", () => {
      lexer.remove(-100, 9);
      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.Content, literal: "class" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
      ];

      expect(got).toEqual(want);
    });

    it("should reverse the start and end values if the start value is greater than the end value", () => {
      lexer.remove(9, -100);
      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.Content, literal: "class" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
      ];

      expect(got).toEqual(want);
    });

    it("should be able to handle a negative start and end value", () => {
      lexer.remove(-100, -50);
      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "documentclass" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
      ];

      expect(got).toEqual(want);
    });

    it("should remove to the end of the document if the end value is very large", () => {
      lexer.remove(9, 10000);
      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "document" },
      ];

      expect(got).toEqual(want);
    });

    it("should not alter the doc if the start and end values are the same", () => {
      lexer.remove(9, 9);
      const got = [...lexer];
      const want: Token[] = [
        { type: TokenType.BackSlash, literal: "\\" },
        { type: TokenType.Content, literal: "documentclass" },
        { type: TokenType.LBracket, literal: "[" },
        { type: TokenType.Content, literal: "12pt" },
        { type: TokenType.RBracket, literal: "]" },
        { type: TokenType.LBrace, literal: "{" },
        { type: TokenType.Content, literal: "article" },
        { type: TokenType.RBrace, literal: "}" },
      ];

      expect(got).toEqual(want);
    });
  });

  describe.todo("caching", () => {
    const insertSpy = jest.fn();
    const removeSpy = jest.fn();
    const addSpy = jest.fn();
    const getSpy = jest.fn();
    const evictSpy = jest.fn();

    class MockCache implements LexerCache {
      public remove(start: number, end: number): LexerCache {
        removeSpy(start, end);
        return this;
      }

      public add(start: number, token: Token): LexerCache {
        addSpy(start, token);
        return this;
      }

      public get(position: number): Token | null {
        getSpy(position);
        return null;
      }

      insert(position: number, token: Token[]): LexerCache {
        insertSpy(position, token);
        return this;
      }
      evict(start: number, end: number): LexerCache {
        evictSpy(start, end);
        return this;
      }
    }

    let lexer: LatexLexer;
    beforeEach(() => {
      insertSpy.mockClear();
      removeSpy.mockClear();
      addSpy.mockClear();
      getSpy.mockClear();
      evictSpy.mockClear();

      lexer = new LatexLexer(FULL_LATEX_DOC, new MockCache());
      lexer;
    });

    it("should lex then insert the new items into the cache when insert is called", () => {
      // TODO
    });
  });
});
