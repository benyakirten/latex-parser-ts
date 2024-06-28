import { type Token, TokenType, type LexerIterValue } from "./types";
/**
 * A lexer that will read a latex file and return a series of tokens.
 */
export class Lexer {
  private position: number = 0;

  constructor(private input: string) {}

  public peek(): Token {
    if (this.position >= this.input.length) {
      return { type: TokenType.EOF, literal: "" };
    }

    const char = this.input[this.position];

    switch (char) {
      case "/":
        return { type: TokenType.ForwardSlash, literal: "/" };
      case "\\":
        return { type: TokenType.BackSlash, literal: "\\" };

      case "(":
        return { type: TokenType.LParen, literal: "(" };
      case ")":
        return { type: TokenType.RParen, literal: ")" };

      case "{":
        return { type: TokenType.LBrace, literal: "{" };
      case "}":
        return { type: TokenType.RBrace, literal: "}" };

      case "[":
        return { type: TokenType.LBracket, literal: "[" };
      case "]":
        return { type: TokenType.RBracket, literal: "]" };
      case "%":
        return { type: TokenType.Percent, literal: "%" };
      case "$":
        return { type: TokenType.Dollar, literal: "$" };

      case "&":
        return { type: TokenType.Ampersand, literal: "&" };
      case "#":
        return { type: TokenType.Hash, literal: "#" };

      case "_":
        return { type: TokenType.Underscore, literal: "_" };
      case "^":
        return { type: TokenType.Caret, literal: "^" };

      case " ":
        return { type: TokenType.Space, literal: " " };
      case "\t":
        return { type: TokenType.Tab, literal: "\t" };

      case "~":
        return { type: TokenType.Tilde, literal: "~" };

      case "\n":
        return { type: TokenType.EndLine, literal: "\n" };
      default:
        return { type: TokenType.Char, literal: char };
    }
  }

  public nextToken(): Token {
    const token = this.peek();
    this.position++;
    return token;
  }

  public next(): LexerIterValue {
    const token = this.nextToken();
    if (token.type === TokenType.EOF) {
      return { done: true, value: token };
    }

    return { done: false, value: token };
  }

  [Symbol.iterator]() {
    return this;
  }
}
