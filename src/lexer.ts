import { type Token, TokenType } from "./types";
import { clamp } from "./utils";
/**
 * A lexer that will read a latex file and return a series of tokens.
 */
export class LatexLexer {
  static #BREAK_CHARACTERS = new Set([
    "[",
    "]",
    "(",
    ")",
    "{",
    "}",
    "%",
    "$",
    "&",
    "#",
    "_",
    "^",
    "~",
    "\n",
    "\t",
    " ",
    "\\",
    "/",
  ]);

  private position: number = 0;
  constructor(private input: string) {}

  public seek(position: number) {
    if (position < 0) {
      position = this.input.length + position;
    }

    this.position = clamp(position, 0, this.input.length);
  }

  public nextToken(): Token {
    const char = this.input.at(this.position);
    if (!char) {
      return { type: TokenType.EOF, literal: "" };
    }

    let token: Token;
    switch (char) {
      case "/":
        token = { type: TokenType.ForwardSlash, literal: "/" };
        break;
      case "\\":
        token = { type: TokenType.BackSlash, literal: "\\" };
        break;

      case "(":
        token = { type: TokenType.LParen, literal: "(" };
        break;
      case ")":
        token = { type: TokenType.RParen, literal: ")" };
        break;

      case "{":
        token = { type: TokenType.LBrace, literal: "{" };
        break;
      case "}":
        token = { type: TokenType.RBrace, literal: "}" };
        break;

      case "[":
        token = { type: TokenType.LBracket, literal: "[" };
        break;
      case "]":
        token = { type: TokenType.RBracket, literal: "]" };
        break;

      case "%":
        token = { type: TokenType.Percent, literal: "%" };
        break;
      case "$":
        token = { type: TokenType.Dollar, literal: "$" };
        break;
      case "&":
        token = { type: TokenType.Ampersand, literal: "&" };
        break;
      case "#":
        token = { type: TokenType.Hash, literal: "#" };
        break;
      case "_":
        token = { type: TokenType.Underscore, literal: "_" };
        break;
      case "^":
        token = { type: TokenType.Caret, literal: "^" };
        break;

      case " ":
        token = { type: TokenType.Space, literal: " " };
        break;
      case "\t":
        token = { type: TokenType.Tab, literal: "\t" };
        break;

      case "\n":
        token = { type: TokenType.EndOfLine, literal: "\n" };
        break;
      default:
        return this.readContent();
    }

    this.position++;
    return token;
  }

  private readContent(): Token {
    let content: string = "";
    let item = this.input.at(this.position);

    while (item && !LatexLexer.#BREAK_CHARACTERS.has(item)) {
      content += item;

      this.position++;
      item = this.input.at(this.position);
    }

    return { type: TokenType.Content, literal: content };
  }

  public next(): IteratorResult<Token> {
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
