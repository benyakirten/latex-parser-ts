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
  | ContentToken
  | TabToken
  | SpaceToken
  | EndOfLineToken
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

type EndOfLineToken = {
  type: TokenType.EndOfLine;
  literal: "\n";
};

type ContentToken = {
  type: TokenType.Content;
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
  EndOfLine,
  Content,
  Space,
  Tab,
  EOF,
}

export interface LexerCache {
  add(position: number, token: Token): LexerCache;
  insert(position: number, token: Token[]): LexerCache;
  remove(start: number, end: number): LexerCache;
  get(position: number): Token | null;
  evict(start: number, end: number): LexerCache;
}
