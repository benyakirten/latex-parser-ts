import type { BuiltinType } from "./builtins/types";
import type { Font } from "./fonts/types";

export type Item = Builtin | FontCommand;

export type Builtin = {
	type: ItemType.BuiltIn;
	command: BuiltinType;
	name: string;
};

export type FontCommand = {
	type: ItemType.FontCommand;
	font: Font;
};

export enum ItemType {
	BuiltIn = 1,
	FontCommand = 2,
}

// TODO: Figure out if Copilot suggested valid things
// export enum TextFormatting {
//   Bold,
//   Italic,
//   Underline,
//   Strikethrough,
//   Code,
//   Verbatim,
//   Emphasis,
//   Strong,
//   SmallCaps,
//   AllCaps,
//   Capitalize,
//   Uppercase,
//   Lowercase,
//   Superscript,
//   Subscript,
//   Footnote,
//   Hyperlink,
//   HyperlinkReference,
//   Image,
//   ImageReference,
//   Table,
//   TableReference,
//   Figure,
//   FigureReference,
//   Equation,
//   EquationReference,
//   CodeBlock,
//   Quote,
//   Blockquote,
//   Comment,
//   Highlight,
//   Mark,
//   Insert,
//   Delete,
//   Small,
//   Tiny,
//   ScriptSize,
//   FootnoteSize,
//   Large,
//   LLarge,
//   LLLarge,
//   Huge,
//   HHuge,
// }
