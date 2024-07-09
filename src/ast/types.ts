import type { LatexBuiltinType } from "./builtins/types";
import type { LatexFont } from "./fonts/types";

export type LatexItem = LatexBuiltin | LatexFontCommand;

export type LatexBuiltin = {
	type: LatexItemType.BuiltIn;
	command: LatexBuiltinType;
	name: string;
};

export type LatexFontCommand = {
	type: LatexItemType.FontCommand;
	font: LatexFont;
};

export enum LatexItemType {
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
