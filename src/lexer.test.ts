import { it, expect, describe, beforeEach } from "bun:test";

import { LatexLexer } from "./lexer";
import { TokenType, type Token } from "./types";

const LATEX_DOC = `\\documentclass[12pt]{article}
\\( E = mc^2 \\). And here is a displayed equation:
\\[
\\int_a^b f(x)\\,dx
\\]
\\\tbegin{figure:sample}[h]
\\includegraphics[width=0.5\\textwidth]{example.jpg}`;

describe("LatexLexer", () => {
  it("should correctly lex a latex document", () => {
    const lexer = new LatexLexer(LATEX_DOC);

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
    let lexer: LatexLexer;
    beforeEach(() => {
      lexer = new LatexLexer(`\\documentclass[12pt]{article}`);
    });

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
});
