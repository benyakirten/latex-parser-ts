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
  CommandToken,
  FontValue,
}

export enum LatexFontEncodingType {
  Normal,
  Local,
}

export type LatexFontEncoding = FontValue<LatexFontEncodingValue>;
export type LatexFontEncodingValue = LatexFontEncodingLocal | LatexFontEncodingNormal;
export type LatexFontEncodingLocal = {
  type: LatexFontEncodingType.Local;
  encoding: string;
};

export type LatexFontEncodingNormal = {
  type: LatexFontEncodingType.Normal;
  encoding: LatexFontEncodingNormalValue;
};

export enum LatexFontEncodingNormalValue {
  KnuthTexText = "ot1",
  ExtendedText = "t1",
  MathItalic = "oml",
  MathSymbols = "oms",
  MathLargeSymbols = "omx",
  Unknown = "u",
}

export type LatexFontSeries = FontValue<LatexFontSeriesValue>;
export type LatexFontSeriesValue = {
  weight: LatexFontWeight;
  width: LatexFontWidth;
};

/** corresponds to font-stretch */
export enum LatexFontWidth {
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
export enum LatexFontWeight {
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

export type LatexFontShape = FontValue<LatexFontShapeValue>;
/**
 * Small caps comes from font variant
 * Italic and slanted (oblique) come from font style
 * TODO: Find out what spaced caps, swash and upright italic are.
 */
export enum LatexFontShapeValue {
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

export enum LatexFontSizeUnit {
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

export type LatexFontMeasurement = FontValue<LatexFontMeasurementValue>;
export type LatexFontMeasurementValue = {
  value: number;
  unit: LatexFontSizeUnit;
};

export type LatexFontFamily = FontValue<LatexFontFamilyPreference | string>;
export enum LatexFontFamilyPreference {
  PrefersSerif = "@@prefers-serif",
  PrefersSansSerif = "@@prefers-sans-serif",
  PrefersMonospace = "@@prefers-monospace",
}

export type LatexFontLineSpread = FontValue<number>;

export type LatexFont = Partial<{
  encoding: LatexFontEncoding;
  family: LatexFontFamily;
  size: LatexFontMeasurement;
  baselineSkip: LatexFontMeasurement;
  series: LatexFontSeries;
  shape: LatexFontShape;
  lineSpread: LatexFontLineSpread;
}>;

// I tried to source these but couldn't find a good singular source.
// You may want to look at https://tug.org/FontCatalogue/
// To simplif work, we will only allow a selected amount of fonts
// I am also not sure of how useful these are.
export const latexFontCorrespondence: Record<string, string> = {
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
  Encoding,
  Family,
  Series,
  Shape,
  Size,
  LineSpread,
}

export type SelectionCommandFontEncoding = {
  type: SelectionCommandType.Encoding;
  encoding: LatexFontEncoding;
};

export type SelectionCommandFontFamily = {
  type: SelectionCommandType.Family;
  family: LatexFontFamily;
};

export type SelectionCommandFontSeries = {
  type: SelectionCommandType.Series;
  series: LatexFontSeries;
};

export type SelectionCommandFontShape = {
  type: SelectionCommandType.Shape;
  shape: LatexFontShape;
};

export type SelectionCommandFontSize = {
  type: SelectionCommandType.Size;
  size: LatexFontMeasurement;
  baselineSkip: LatexFontMeasurement;
};

export type SelectionCommandFontLineSpread = {
  type: SelectionCommandType.LineSpread;
  value: LatexFontLineSpread;
};

export type LatexFontCurrentValues = Partial<{
  encoding: LatexFontEncoding;
  family: LatexFontFamily;
  series: LatexFontSeries;
  shape: LatexFontShape;
  size: LatexFontMeasurement;
  baselineSkip: LatexFontMeasurement;
  mathSize: LatexFontMeasurement;
  mathScriptSize: LatexFontMeasurement;
  mathScriptScriptSize: LatexFontMeasurement;
}>;

export type LatexAuthorDefaults = Partial<{
  serif: LatexFontFamily;
  sans: LatexFontFamily;
  monospace: LatexFontFamily;
  family: LatexFontFamily;
  series: LatexFontSeries;
  shape: LatexFontShape;
  bold: LatexFontSeries;
  medium: LatexFontSeries;
  italics: LatexFontShape;
  oblique: LatexFontShape;
  smallCaps: LatexFontShape;
  spacedSmallCaps: LatexFontShape;
  swash: LatexFontShape;
  upcase: LatexFontShape;
  lowercase: LatexFontShape;
  normal: LatexFont;
}>;

export enum AuthorCommandType {
  AuthorDefault,
  FontSize,
}

export type AuthorCommand =
  | {
      type: AuthorCommandType.AuthorDefault;
      value: keyof LatexAuthorDefaults;
    }
  | {
      type: AuthorCommandType.FontSize;
      value: LatexFontMeasurement;
    };
