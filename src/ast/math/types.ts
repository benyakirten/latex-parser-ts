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

export enum MathSymbolFont {
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

export type SymbolFontAlphabet = {
	mathAlphabet: string;
	symbolFont: string;
};

export enum MathSymbolType {
	Ordinary = "\\mathord", // 0
	LargeOperator = "\\mathop", // 1
	BinaryOperator = "\\mathbin", // 2
	Relation = "\\mathrel", // 3
	Open = "\\mathopen", // 4
	Close = "\\mathclose", // 5
	Punctuation = "\\mathpunct", // 6
	AlphabetChar = "\\mathalpha", // 7
}

export enum MathSymbolValueType {
	Char = 1,
	Command = 2,
}

export type MathSymbolValue =
	| {
			type: MathSymbolValueType.Command;
			value: string;
	  }
	| {
			type: MathSymbolValueType.Char;
			value: string;
	  };

export type MathSymbol = {
	symbol: MathSymbolValue;
	type: MathSymbolType;
	fontSlot: SymbolFontWithSlot;
};

export type SymbolFontWithSlot = {
	symbolFont: string;
	slot: string;
};

export type MathDelimiter = {
	symbol: MathSymbolValue;
	type: MathSymbolType;
	fontSlot1: SymbolFontWithSlot;
	fontSlot2: SymbolFontWithSlot;
};

export type MathAccent = MathSymbol;
