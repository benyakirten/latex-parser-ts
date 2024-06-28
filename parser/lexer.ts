export type Token =
  | BackslashToken
  | LParenToken
  | RParenToken
  | LBraceToken
  | RBraceToken
  | LBracketToken
  | RBracketToken
  | PercentToken
  | DollarToken
  | AmpersandToken
  | HashToken
  | UnderscoreToken
  | CaretToken
  | TildeToken
  | ForwardSlashToken
  | EndLineToken
  | CharToken;

type BackslashToken = {
  type: TokenType.BackSlash;
  literal: "\\";
};

type LParenToken = {
  type: TokenType.LParen;
  literal: "(";
};

type RParenToken = {
  type: TokenType.RParen;
  literal: ")";
};

type LBraceToken = {
  type: TokenType.LBrace;
  literal: "{";
};

type RBraceToken = {
  type: TokenType.RBrace;
  literal: "}";
};

type LBracketToken = {
  type: TokenType.LBracket;
  literal: "[";
};

type RBracketToken = {
  type: TokenType.RBracket;
  literal: "]";
};

type PercentToken = {
  type: TokenType.Percent;
  literal: "%";
};

type DollarToken = {
  type: TokenType.Dollar;
  literal: "$";
};

type AmpersandToken = {
  type: TokenType.Ampersand;
  literal: "&";
};

type HashToken = {
  type: TokenType.Hash;
  literal: "#";
};

type UnderscoreToken = {
  type: TokenType.Underscore;
  literal: "_";
};

type CaretToken = {
  type: TokenType.Caret;
  literal: "^";
};

type TildeToken = {
  type: TokenType.Tilde;
  literal: "~";
};

type ForwardSlashToken = {
  type: TokenType.ForwardSlash;
  literal: "/";
};

type EndLineToken = {
  type: TokenType.EndLine;
  literal: "\n";
};

type CharToken = {
  type: TokenType.Char;
  literal: string;
};

enum TokenType {
  BackSlash,
  LParen,
  RParen,
  LBrace,
  RBrace,
  LBracket,
  RBracket,
  Percent,
  Dollar,
  Ampersand,
  Hash,
  Underscore,
  Caret,
  Tilde,
  ForwardSlash,
  EndLine,
  Char,
}

/**
 * A lexer that will read a latex file and return a series of tokens.
 */
export class Lexer {
  private position: number = 0;

  constructor(private input: string) {}

  private read(): Token | null {
    if (this.position >= this.input.length) {
      return null;
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

      case "~":
        return { type: TokenType.Tilde, literal: "~" };

      case "\n":
        return { type: TokenType.EndLine, literal: "\n" };
      default:
        return { type: TokenType.Char, literal: char };
    }
  }

  public peek(): Token | null {
    return this.read();
  }

  public nextToken(): Token | null {
    const token = this.read();
    this.position++;
    return token;
  }

  public next() {
    const t = this.nextToken();
    if (t) {
      return { value: t, done: false };
    } else {
      return { value: null, done: true };
    }
  }

  [Symbol.iterator]() {
    return this;
  }
}
