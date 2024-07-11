export enum MathFont {
	Normal = "\\mathnormal",
	Serif = "\\mathrm",
	BoldRoman = "\\mathbf",
	SansSerif = "\\mathsf",
	TextItalic = "\\mathit",
	Typewriter = "\\mathtt",
	Calligraphic = "\\mathcal",
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
