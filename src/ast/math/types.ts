import type {
	LatexFontEncoding,
	LatexFontFamily,
	LatexFontSeries,
	LatexFontShape,
} from "../fonts/types";

export enum MathFont {
	Normal = "mathnormal",
	Serif = "mathrm",
	BoldRoman = "mathbf",
	SansSerif = "mathsf",
	TextItalic = "mathit",
	Typewriter = "mathtt",
	Calligraphic = "mathcal",
}

export enum MathSymbolFonts {
	Operators = "operators", // symbols from \mathrm
	Letters = "letters", // symbols from \mathnormal
	Symbols = "symbols", // most LATEX symbols
	LargeSymbols = "largesymbols", // large symbols
}

export enum MathFontVersion {
	Normal = 1,
	Bold = 2,
}

export type MathAlphabetDeclarationValue<T> =
	| {
			type: MathAlphabetDeclarationType.Reset;
	  }
	| {
			type: MathAlphabetDeclarationType.Set;
			value: T;
	  };

export enum MathAlphabetDeclarationType {
	Set = 1,
	Reset = 2,
}

export type MathAlphabetBase = {
	encoding: MathAlphabetDeclarationValue<LatexFontEncoding>;
	family: MathAlphabetDeclarationValue<LatexFontFamily>;
	series: MathAlphabetDeclarationValue<LatexFontSeries>;
	shape: MathAlphabetDeclarationValue<LatexFontShape>;
};

export type MathAlphabetDeclaration = MathAlphabetBase & {
	name: string;
};

export type SetMathAlphabetDeclaration = MathAlphabetDeclaration & {
	name: string;
	version: string;
};
