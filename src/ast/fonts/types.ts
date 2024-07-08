// These are to choose fonts
// Such as condensed and bold will be condensed bold X font

import type { CommandToken } from "../../lexer/types";

export enum LatexFontEncodingType {
  Normal,
  Local,
}

export type LatexFontEncoding = LatexFontEncodingLocal | LatexFontEncodingNormal | CommandToken;

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

export type LatexFontSeries = LatexFontSeriesValue | CommandToken;
export type LatexFontSeriesValue = {
  weight: LatexFontWeight;
  width: LatexFontWidth;
};

export type LatexFontWidth = CommandToken | LatexFontWidthValue;

/** corresponds to font-stretch */
export enum LatexFontWidthValue {
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

export type LatexFontWeight = CommandToken | LatexFontWeightValue;
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
export enum LatexFontWeightValue {
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

export type LatexFontShape = LatexFontShapeValue | CommandToken;
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

export type LatexFontMeasurement = LatexFontMeasurementValue | CommandToken;
export type LatexFontMeasurementValue = {
  value: number;
  unit: LatexFontSizeUnit;
};

export enum LatexFontFamilyPreference {
  PrefersSerif = "@@prefers-serif",
  PrefersSansSerif = "@@prefers-sans-serif",
  PrefersMonospace = "@@prefers-monospace",
}

export type LatexFont = {
  encoding?: LatexFontEncoding;
  family?: LatexFontFamilyPreference | string | CommandToken;
  size?: LatexFontMeasurement;
  baselineSkip?: LatexFontMeasurement;
  weight?: LatexFontWeight;
  width?: LatexFontWidth;
  shape?: LatexFontShape;
  lineSpread?: number | CommandToken;
};

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
  family: string;
};

export type SelectionCommandFontSeries = {
  type: SelectionCommandType.Series;
  weight: LatexFontWeight;
  width: LatexFontWidth;
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
  value: number;
};
