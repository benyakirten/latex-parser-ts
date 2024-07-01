// These are to choose fonts
// Such as condensed and bold will be condensed bold X font

export enum LatexFontEncoding {
  KnuthTexText = "ot1",
  TextExtended = "t1",
  MathItalic = "oml",
  MathSymbols = "oms",
  MathLargeSymbols = "omx",
  Unknown = "u",
  LocalEncoding = "l",
}

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

/**
 * Small caps comes from font variant
 * Italic and slanted (oblique) come from font style
 * TODO: Find out what spaced caps, swash and upright italic are.
 */
export enum LatexFontShape {
  Normal = "n",
  Italic = "it",
  UprightItalic = "ui",
  Slanted = "sl", // AKA Oblique
  CapsAndSmallCaps = "sc",
  CapsAndSmallCapsItalics = "scit",
  CapsAndSmallCapsSlanted = "scsl",
  Swash = "sw",
  SpacedCapsAndSmallCaps = "ssc",
}

export enum LatexFontSizeUnit {
  Point = "pt",
  Inch = "in",
  Millimeter = "mm",
}

export type LatexFontMeasurement = {
  value: number;
  unit: LatexFontSizeUnit;
};

export type LatexFont = {
  encoding?: LatexFontEncoding;
  family?: string;
  size?: LatexFontMeasurement;
  baselineskip?: LatexFontMeasurement;
  weight?: LatexFontWeight;
  width?: LatexFontWidth;
  shape?: LatexFontShape;
};

// I tried to source these but couldn't find a good singular source.
// You may want to look at https://tug.org/FontCatalogue/
// To simplif work, we will only allow a selected amount of fonts
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
  | FontEncodingSelectionCommand
  | FontFamilySelectionCommand
  | FontSeriesSelectionCommand
  | FontShapeSelectionCommand
  | FontSizeSelectionCommand
  | FontLineSpreadSelectionCommand;

export enum FontSelectionType {
  Encoding,
  Family,
  Series,
  Shape,
  Size,
  LineSpread,
}

type FontEncodingSelectionCommand = {
  type: FontSelectionType.Encoding;
  encoding: LatexFontEncoding;
};

type FontFamilySelectionCommand = {
  type: FontSelectionType.Family;
  family: string;
};

type FontSeriesSelectionCommand = {
  type: FontSelectionType.Series;
  weight: LatexFontWeight;
  width: LatexFontWidth;
};

type FontShapeSelectionCommand = {
  type: FontSelectionType.Shape;
  shape: LatexFontShape;
};

type FontSizeSelectionCommand = {
  type: FontSelectionType.Size;
  size: LatexFontMeasurement;
  baselineskip: LatexFontMeasurement;
};

type FontLineSpreadSelectionCommand = {
  type: FontSelectionType.LineSpread;
  value: number;
};
