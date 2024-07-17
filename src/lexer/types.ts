export type Token = {
	position: number;
} & TokenData;

type TokenData =
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
	type: TokenType.Accent;
	literal: `\\${AccentType}${string}`;
	detail: AccentType;
	content: Token;
};

export type RequiredArgument = {
	type: CommandArgumentType.Required;
	content: Token[];
};

export type OptionalArgument = {
	type: CommandArgumentType.Optional;
	content: CommandToken | ContentToken | LabeledArgContent[];
};

export type Argument = RequiredArgument | OptionalArgument;
export type Arguments = Argument[];

export type SimpleMacro = {
	type: TokenType.Command;
	literal: `\\${string}`;
	name: string;
	arguments: [];
};

export type CommandToken = {
	type: TokenType.Command;
	literal: `\\${string}`;
	name: string;
	arguments: Arguments;
};

export enum MathPosition {
	Inline = 1,
	Block = 2,
	Centered = 3,
}

type MathStartCharacter = "$" | "\\(" | "\\[";
type MathEndCharacter = "$" | "\\)" | "\\]";
export type MathToken = {
	type: TokenType.Math;
	literal: `${MathStartCharacter}${string}${MathEndCharacter}`;
	content: Token[];
	position: MathPosition;
};

export type BlockToken = {
	type: TokenType.Block;
	literal: `{${string}}`;
	content: Token[];
};

export type LabeledArgContent = { key: string; value: Token[] };

export type CommentToken = {
	type: TokenType.Comment;
	literal: `%${string}`;
	content: string;
};

export type ColumnAlignToken = {
	type: TokenType.ColumnAlign;
	literal: "&";
};

export type PlaceholderToken = {
	type: TokenType.Placeholder;
	literal: `#${string}`;
	content: number;
};

export enum ScriptTokenType {
	Super = "^",
	Sub = "_",
}
export type ScriptToken = {
	type: TokenType.Script;
	detail: ScriptTokenType;
	literal: `${ScriptTokenType}${string}`;
	content: Token;
};

export type EndOfLineToken = {
	type: TokenType.EndOfLine;
	literal: "\n";
	continueText: boolean;
};

export type ContentToken = {
	type: TokenType.Content;
	literal: string;
	originalLength: number;
};

export enum CommandArgumentType {
	Optional = 1,
	Required = 2,
}

export enum TokenType {
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

export enum CharType {
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
 * Accents contain a backslash then an accent character, as shown in the AccentType enum.
 * For accents that are a non-alphabetic character, the account can either be followed by a single character
 * or a group of characters enclosed in braces. For accents that are alphabetic characters, the accent must
 * be followed by a group of characters (or a single character) enclosed in braces.
 */
export type AccentType = VariableAccent | BlockRequiredAccent;
export enum VariableAccent {
	Circumflex = "^",
	Tilde = "~",
	Grave = "`",
	Acute = "'",
	Diaresis = '"',
	Macron = "=",
	OverDot = ".",
}

export enum BlockRequiredAccent {
	HungarianUmlaut = "H",
	Cedilla = "c",
	UnderBar = "b",
	UnderDot = "d",
	Breve = "u",
	OverVector = "v",
	Tie = "t",
}

export interface LexerCache {
	add(position: number, token: Token): LexerCache;
	insert(position: number, token: Token[]): LexerCache;
	remove(start: number, end: number): LexerCache;
	get(position: number): Token | null;
	evict(start: number, end: number): LexerCache;
}
