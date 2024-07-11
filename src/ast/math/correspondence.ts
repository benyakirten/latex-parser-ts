import {
	FontValueType,
	type LatexFont,
	LatexFontEncodingNormalValue,
	LatexFontEncodingType,
	LatexFontShapeValue,
	LatexFontWeight,
	LatexFontWidth,
} from "../fonts/types";
import { MathFont, MathSymbolFonts } from "./types";

const mathNormalCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.MathItalic,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmm",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Medium,
			width: LatexFontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Italic,
	},
};

const mathSerifCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmr",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Medium,
			width: LatexFontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Normal,
	},
};

const mathCalligraphicSymbolsCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.MathSymbols,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmsy",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Medium,
			width: LatexFontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Normal,
	},
};

const mathCalligraphicLargeSymbolsCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.MathLargeSymbols,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmex",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Medium,
			width: LatexFontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Normal,
	},
};

const mathBoldFontCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmr",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Bold,
			width: LatexFontWidth.Expanded,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Normal,
	},
};

const mathSansSerifCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmss",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Medium,
			width: LatexFontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Normal,
	},
};

const mathItalicsCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmss",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Medium,
			width: LatexFontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Italic,
	},
};

const mathTypewriterCorrespondence: LatexFont = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: LatexFontEncodingType.Normal,
			encoding: LatexFontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmtt",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: LatexFontWeight.Medium,
			width: LatexFontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: LatexFontShapeValue.Normal,
	},
};

export const fontCorrespondence = {
	normal: mathNormalCorrespondence,
	roman: mathSerifCorrespondence,
	calligraphicSymbols: mathCalligraphicSymbolsCorrespondence,
	callgraphicLargeSymbols: mathCalligraphicLargeSymbolsCorrespondence,
	bold: mathBoldFontCorrespondence,
	sansSerif: mathSansSerifCorrespondence,
	italics: mathItalicsCorrespondence,
	typewriter: mathTypewriterCorrespondence,
} as const;

export function getMathCorrespondenceFont(
	name: MathFont,
	isLargeSymbols = false,
): LatexFont | null {
	switch (name) {
		case MathFont.Normal:
			return fontCorrespondence.normal;
		case MathFont.Serif:
			return fontCorrespondence.roman;
		case MathFont.Calligraphic:
			return isLargeSymbols
				? fontCorrespondence.callgraphicLargeSymbols
				: fontCorrespondence.calligraphicSymbols;
		case MathFont.BoldRoman:
			return fontCorrespondence.bold;
		case MathFont.SansSerif:
			return fontCorrespondence.sansSerif;
		case MathFont.TextItalic:
			return fontCorrespondence.italics;
		case MathFont.Typewriter:
			return fontCorrespondence.typewriter;
		default:
			return null;
	}
}

export function getMathSymbolsCorrespondenceFont(
	name: MathSymbolFonts,
): LatexFont | null {
	switch (name) {
		case MathSymbolFonts.Letters:
			return fontCorrespondence.normal;
		case MathSymbolFonts.Operators:
			return fontCorrespondence.roman;
		case MathSymbolFonts.Symbols:
			return fontCorrespondence.calligraphicSymbols;
		case MathSymbolFonts.LargeSymbols:
			return fontCorrespondence.callgraphicLargeSymbols;
		default:
			return null;
	}
}
