import {
	type Font,
	FontEncodingNormalValue,
	FontEncodingType,
	FontShapeValue,
	FontValueType,
	FontWeight,
	FontWidth,
} from "../fonts/types";
import { MathFont, MathSymbolFont } from "./types";

const mathNormalCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.MathItalic,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmm",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Medium,
			width: FontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Italic,
	},
};

const mathSerifCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmr",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Medium,
			width: FontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Normal,
	},
};

const mathCalligraphicSymbolsCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.MathSymbols,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmsy",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Medium,
			width: FontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Normal,
	},
};

const mathCalligraphicLargeSymbolsCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.MathLargeSymbols,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmex",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Medium,
			width: FontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Normal,
	},
};

const mathBoldFontCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmr",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Bold,
			width: FontWidth.Expanded,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Normal,
	},
};

const mathSansSerifCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmss",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Medium,
			width: FontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Normal,
	},
};

const mathItalicsCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmss",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Medium,
			width: FontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Italic,
	},
};

const mathTypewriterCorrespondence: Font = {
	encoding: {
		type: FontValueType.FontValue,
		value: {
			type: FontEncodingType.Normal,
			encoding: FontEncodingNormalValue.KnuthTexText,
		},
	},
	family: {
		type: FontValueType.FontValue,
		value: "cmtt",
	},
	series: {
		type: FontValueType.FontValue,
		value: {
			weight: FontWeight.Medium,
			width: FontWidth.Medium,
		},
	},
	shape: {
		type: FontValueType.FontValue,
		value: FontShapeValue.Normal,
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
): Font | null {
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
	name: MathSymbolFont,
): Font | null {
	switch (name) {
		case MathSymbolFont.Letters:
			return fontCorrespondence.normal;
		case MathSymbolFont.Operators:
			return fontCorrespondence.roman;
		case MathSymbolFont.Symbols:
			return fontCorrespondence.calligraphicSymbols;
		case MathSymbolFont.LargeSymbols:
			return fontCorrespondence.callgraphicLargeSymbols;
		default:
			return null;
	}
}
