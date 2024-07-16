export type LatexToken =
	| CommandToken
	| MathToken
	| BlockToken
	| AccentToken
	| CommentToken
	| ColumnAlignToken
	| PlaceholderToken
	| ScriptToken
	| ContentToken
	| EndOfLineToken;

export type AccentToken = {
	type: LatexTokenType.Accent;
	literal: `\\${AccentType}${string}`;
	detail: AccentType;
	content: LatexToken;
};

export type RequiredArgument = {
	type: LatexCommandArgumentType.Required;
	content: LatexToken[];
};

export type OptionalArgument = {
	type: LatexCommandArgumentType.Optional;
	content: CommandToken | ContentToken | LabeledArgContent[];
};

export type LatexArgument = RequiredArgument | OptionalArgument;
export type LatexArguments = LatexArgument[];

export type SimpleMacro = {
	type: LatexTokenType.Command;
	literal: `\\${string}`;
	name: string;
	arguments: [];
};

export type CommandToken = {
	type: LatexTokenType.Command;
	literal: `\\${string}`;
	name: string;
	arguments: LatexArguments;
};

export enum MathPosition {
	Inline = 1,
	Block = 2,
	Centered = 3,
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

export type LabeledArgContent = { key: string; value: LatexToken[] };

export type CommentToken = {
	type: LatexTokenType.Comment;
	literal: `%${string}`;
	content: string;
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

export enum ScriptTokenType {
	Super = "^",
	Sub = "_",
}
export type ScriptToken = {
	type: LatexTokenType.Script;
	detail: ScriptTokenType;
	literal: `${ScriptTokenType}${string}`;
	content: LatexToken;
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
	Optional = 1,
	Required = 2,
}

export enum LatexTokenType {
	Command = "command",
	Math = "math",
	Block = "block",
	ColumnAlign = "columnalign",
	Comment = "comment",
	Script = "script",
	Placeholder = "placeholder",
	NonBreakingSpace = "nonbreakingspace",
	Content = "content",
	EndOfLine = "endofline",
	Accent = "accent",
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
	Comma = ",",
}

/**
 * Accents contain a backslash then an accent character, as shown in the LatexAccentType enum.
 * For accents that are a non-alphabetic character, the account can either be followed by a single character
 * or a group of characters enclosed in braces. For accents that are alphabetic characters, the accent must
 * be followed by a group of characters (or a single character) enclosed in braces.
 */
export type AccentType = VariableAccent | BraceRequiredAccent;
export enum VariableAccent {
	Circumflex = "\\^",
	Tilde = "\\~",
	Grave = "\\`",
	Acute = "\\'",
	Diaresis = '\\"',
	Macron = "\\=",
	OverDot = "\\.",
}

export enum BraceRequiredAccent {
	HungarianUmlaut = "\\H",
	Cedilla = "\\c",
	UnderBar = "\\b",
	UnderDot = "\\d",
	Breve = "\\u",
	OverVector = "\\v",
	Tie = "\\t",
}

export interface LexerCache {
	add(position: number, token: LatexToken): LexerCache;
	insert(position: number, token: LatexToken[]): LexerCache;
	remove(start: number, end: number): LexerCache;
	get(position: number): LatexToken | null;
	evict(start: number, end: number): LexerCache;
}
