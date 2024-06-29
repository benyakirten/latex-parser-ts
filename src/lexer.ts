import { NoCache } from "./cache";
import { clamp } from "./utils";
import { type Token, type LexerCache, TokenType } from "./types";
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
  private cache: LexerCache;
  constructor(
    private input: string,
    cache?: LexerCache,
  ) {
    this.cache = cache ?? new NoCache();
  }

  public seek(position: number) {
    if (position < 0) {
      position = this.input.length + position;
    }

    this.position = clamp(position, 0, this.input.length);
  }

  public insert(position: number, value: string): LatexLexer {
    if (position < 0) {
      position = this.input.length + position;
    }

    position = clamp(position, 0, this.input.length);
    this.input = this.input.slice(0, position) + value + this.input.slice(position);

    const iter = new LatexLexer(value);
    this.cache.insert(position, [...iter]);

    return this;
  }

  public remove(start: number, end: number): LatexLexer {
    if (start === end) {
      return this;
    }

    start = clamp(start, 0, this.input.length);
    end = clamp(end, 0, this.input.length);
    if (start > end) {
      [start, end] = [end, start];
    }

    this.input = this.input.slice(0, start) + this.input.slice(end);
    this.cache.remove(start, end);

    return this;
  }

  public nextToken(): Token {
    const char = this.input.at(this.position);
    if (!char) {
      return { type: TokenType.EOF, literal: "" };
    }

    const cachedItem = this.cache.get(this.position);
    if (cachedItem) {
      this.position += cachedItem.literal.length;
      return cachedItem;
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

    this.cache.add(this.position, token);
    this.position++;
    return token;
  }

  private readContent(): Token {
    let content: string = "";
    const startPosition = this.position;
    let item = this.input.at(this.position);

    while (item && !LatexLexer.#BREAK_CHARACTERS.has(item)) {
      content += item;

      this.position++;
      item = this.input.at(this.position);
    }

    const token: Token = { type: TokenType.Content, literal: content };
    this.cache.add(startPosition, token);

    return token;
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
