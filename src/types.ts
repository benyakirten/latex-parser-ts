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
  | CharToken
  | TabToken
  | SpaceToken
  | EndLineToken
  | EOFToken;

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

type SpaceToken = {
  type: TokenType.Space;
  literal: " ";
};

type TabToken = {
  type: TokenType.Tab;
  literal: "\t";
};

type EOFToken = {
  type: TokenType.EOF;
  literal: "";
};

export enum TokenType {
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
  Space,
  Tab,
  EOF,
}

export type LexerIterValue = {
  done: boolean;
  value: Token;
};
