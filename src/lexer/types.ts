export type LatexToken =
  | CommandToken
  | MathToken
  | BlockToken
  | AccentToken
  | CommentToken
  | ColumnAlignToken
  | PlaceholderToken
  | SuperscriptToken
  | SubscriptToken
  | ContentToken
  | EndOfLineToken;

export type AccentToken = {
  type: LatexTokenType.Accent;
  literal: "\\^" | "\\~";
  accent: LatexAccentType;
};

export type RequiredArgument = {
  type: LatexCommandArgumentType.Required;
  content: LatexArgument;
};

export type OptionalArgument = {
  type: LatexCommandArgumentType.Optional;
  content: LatexArgument | LabeledArgContent[];
};

export type LatexArguments = (RequiredArgument | OptionalArgument)[];
export type CommandToken = {
  type: LatexTokenType.Command;
  literal: `\\${string}`;
  arguments: LatexArguments;
};

export enum MathPosition {
  Inline,
  Block,
  Centered,
}

type MathStartCharacter = "$" | "\\(" | "\\[";
type MathEndCharacter = "$" | "\\)" | "\\]";
export type MathToken = {
  type: LatexTokenType.Math;
  literal: `${MathStartCharacter}${string}${MathEndCharacter}`;
  content: LatexToken[];
  position: MathPosition;
};

export type BlockToken = {
  type: LatexTokenType.Block;
  literal: `{${string}}`;
  content: LatexToken[];
};

export type LatexArgument = ContentToken | CommandToken;
export type LabeledArgContent = { key: string; value: LatexArgument };

export type CommentToken = {
  type: LatexTokenType.Comment;
  literal: `%${string}`;
};

export type ColumnAlignToken = {
  type: LatexTokenType.ColumnAlign;
  literal: "&";
};

export type PlaceholderToken = {
  type: LatexTokenType.Placeholder;
  literal: `#${string}`;
  content: number;
};

export type SuperscriptToken = {
  type: LatexTokenType.Superscript;
  literal: "^";
};

export type SubscriptToken = {
  type: LatexTokenType.Subscript;
  literal: "_";
};

export type EndOfLineToken = {
  type: LatexTokenType.EndOfLine;
  literal: "\n";
  continueText: boolean;
};

export type ContentToken = {
  type: LatexTokenType.Content;
  literal: string;
  originalLength: number;
};

export enum LatexCommandArgumentType {
  Optional,
  Required,
}

export enum LatexTokenType {
  Command,
  Math,
  Block,
  ColumnAlign,
  Comment,
  Superscript,
  Subscript,
  Placeholder,
  NonBreakingSpace,
  Space,
  Tab,
  Content,
  EndOfLine,
  Accent,
}

export enum LatexCharType {
  Backslash = "\\",
  OpenBracket = "[",
  CloseBracket = "]",
  OpenParen = "(",
  CloseParen = ")",
  OpenBrace = "{",
  CloseBrace = "}",
  Percent = "%",
  Dollar = "$",
  Ampersand = "&",
  Hash = "#",
  Underscore = "_",
  Caret = "^",
  Newline = "\n",
  Space = " ",
  Tilde = "~",
}

export enum LatexAccentType {
  Circumflex = "\\^",
  Tilde = "\\~",
}

export interface LexerCache {
  add(position: number, token: LatexToken): LexerCache;
  insert(position: number, token: LatexToken[]): LexerCache;
  remove(start: number, end: number): LexerCache;
  get(position: number): LatexToken | null;
  evict(start: number, end: number): LexerCache;
}
