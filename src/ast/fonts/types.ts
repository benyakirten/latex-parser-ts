// These are to choose fonts
// Such as condensed and bold will be condensed bold X font

import type { CommandToken } from "../../lexer/types";

export type FontValue<T> =
	| {
			type: FontValueType.CommandToken;
			value: CommandToken;
	  }
	| {
			type: FontValueType.FontValue;
			value: T;
	  };

export enum FontValueType {
	CommandToken = 1,
	FontValue = 2,
}

export enum FontEncodingType {
	Normal = 1,
	Local = 2,
}

export type FontEncoding = FontValue<FontEncodingValue>;
export type FontEncodingValue = FontEncodingLocal | FontEncodingNormal;
export type FontEncodingLocal = {
	type: FontEncodingType.Local;
	encoding: string;
};

export type FontEncodingNormal = {
	type: FontEncodingType.Normal;
	encoding: FontEncodingNormalValue;
};

export enum FontEncodingNormalValue {
	KnuthTexText = "ot1",
	ExtendedText = "t1",
	MathItalic = "oml",
	MathSymbols = "oms",
	MathLargeSymbols = "omx",
	Unknown = "u",
}

export type FontSeries = FontValue<FontSeriesValue>;
export type FontSeriesValue = {
	weight: FontWeight;
	width: FontWidth;
};

/** corresponds to font-stretch */
export enum FontWidth {
	UltraCondensed = "uc",
	ExtraCondensed = "ec",
	Condensed = "c",
	SemiCondensed = "sc",
	Medium = "m",
	SemiExpanded = "sx",
	Expanded = "x",
	ExtraExpanded = "ex",
	UltraExpanded = "ux",
}

/**
 * Weight and width are concatenated to a single series value except
 * that m is dropped unless both weight and width are medium in which case
 * a single m is used.
 *
 * Examples:
 * m Medium weight and width
 * b Bold weight, medium width bx Bold extended
 * sb Semi-bold, medium width
 * sbx Semi-bold extended
 * c Medium weight, condensed width
 *
 * Corresponds to css font-weight
 */
export enum FontWeight {
	UltraLight = "ul",
	ExtraLight = "el",
	Light = "l",
	SemiLight = "sl",
	Medium = "m",
	SemiBold = "sb",
	Bold = "b",
	ExtraBold = "eb",
	UltraBold = "ub",
}

export type FontShape = FontValue<FontShapeValue>;
/**
 * Small caps comes from font variant
 * Italic and slanted (oblique) come from font style
 * TODO: Find out what spaced caps, swash and upright italic are.
 */
export enum FontShapeValue {
	Normal = "n",
	Italic = "it",
	UprightItalic = "ui",
	Oblique = "sl", // AKA Slanted - Oblique is used since it's the CSS property name.
	CapsAndSmallCaps = "sc",
	CapsAndSmallCapsItalics = "scit",
	CapsAndSmallCapsOblique = "scsl",
	Swash = "sw",
	SpacedCapsAndSmallCaps = "ssc",
}

export enum FontSizeUnit {
	Point = "pt",
	Inch = "in",
	Millimeter = "mm",
	Centimeter = "cm",
	Pica = "pc",
	DidotPoint = "dd",
	Cicero = "cc",
	ScaledPoint = "sp",
	BigPoint = "bp",
	Em = "em",
	Ex = "ex",
	Mu = "mu", // 1/18 em
	Pixel = "px",
	ViewportHeight = "vh",
	ViewportWidth = "vw",
	ViewportMin = "vmin",
	ViewportMax = "vmax",
}

export type FontMeasurement = FontValue<FontMeasurementValue>;
export type FontMeasurementValue = {
	value: number;
	unit: FontSizeUnit;
};

export type FontFamily = FontValue<FontFamilyPreference | string>;
export enum FontFamilyPreference {
	PrefersSerif = "@@prefers-serif",
	PrefersSansSerif = "@@prefers-sans-serif",
	PrefersMonospace = "@@prefers-monospace",
}

export type FontLineSpread = FontValue<number>;

export type Font = Partial<{
	encoding: FontEncoding;
	family: FontFamily;
	size: FontMeasurement;
	baselineSkip: FontMeasurement;
	series: FontSeries;
	shape: FontShape;
	lineSpread: FontLineSpread;
}>;

// I tried to source these but couldn't find a good singular source.
// You may want to look at https://tug.org/FontCatalogue/
// To simplif work, we will only allow a selected amount of fonts
// I am also not sure of how useful these are.
export const FontCorrespondence: Record<string, string> = {
	cm: "Computer Modern",
	cc: "Concrete",
	phv: "Helvetica",
	pcr: "Courier",
	ptm: "Times Roman",
	pbk: "Bookman",
	ppl: "Palatino",
	pzc: "Zapf Chancery",
	pnc: "New Century Schoolbook Roman Caps",
};

export type SelectionCommand =
	| SelectionCommandFontEncoding
	| SelectionCommandFontFamily
	| SelectionCommandFontSeries
	| SelectionCommandFontShape
	| SelectionCommandFontSize
	| SelectionCommandFontLineSpread;

export enum SelectionCommandType {
	Encoding = 1,
	Family = 2,
	Series = 3,
	Shape = 4,
	Size = 5,
	LineSpread = 6,
}

export type SelectionCommandFontEncoding = {
	type: SelectionCommandType.Encoding;
	encoding: FontEncoding;
};

export type SelectionCommandFontFamily = {
	type: SelectionCommandType.Family;
	family: FontFamily;
};

export type SelectionCommandFontSeries = {
	type: SelectionCommandType.Series;
	series: FontSeries;
};

export type SelectionCommandFontShape = {
	type: SelectionCommandType.Shape;
	shape: FontShape;
};

export type SelectionCommandFontSize = {
	type: SelectionCommandType.Size;
	size: FontMeasurement;
	baselineSkip: FontMeasurement;
};

export type SelectionCommandFontLineSpread = {
	type: SelectionCommandType.LineSpread;
	value: FontLineSpread;
};

export type FontCurrentValues = Partial<{
	encoding: FontEncoding;
	family: FontFamily;
	series: FontSeries;
	shape: FontShape;
	size: FontMeasurement;
	baselineSkip: FontMeasurement;
	mathSize: FontMeasurement;
	mathScriptSize: FontMeasurement;
	mathScriptScriptSize: FontMeasurement;
}>;

export type AuthorDefaults = Partial<{
	serif: FontFamily;
	sans: FontFamily;
	monospace: FontFamily;
	family: FontFamily;
	series: FontSeries;
	shape: FontShape;
	bold: FontSeries;
	medium: FontSeries;
	italics: FontShape;
	oblique: FontShape;
	smallCaps: FontShape;
	spacedSmallCaps: FontShape;
	swash: FontShape;
	upcase: FontShape;
	lowercase: FontShape;
	normal: Font;
}>;

export enum AuthorCommandType {
	AuthorDefault = 1,
	FontSize = 2,
}

export type AuthorCommand =
	| {
			type: AuthorCommandType.AuthorDefault;
			value: keyof AuthorDefaults;
	  }
	| {
			type: AuthorCommandType.FontSize;
			value: FontMeasurement;
	  };

// Special declarations
export type DeclareFixedFontCommand = Font & { name: string };
export type DeclareTextFontCommand = {
	name: string;
	switches: AuthorCommand[];
};
export type DeclareOldFontCommand = {
	name: string;
	textSwitches: AuthorCommand[];
	// TODO: Figure out how math switches differ from text switches.
	mathSwitches: AuthorCommand[];
};
