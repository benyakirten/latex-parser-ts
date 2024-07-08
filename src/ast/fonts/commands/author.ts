import {
  type LatexFont,
  LatexFontWidth,
  LatexFontWeight,
  LatexFontSizeUnit,
  LatexFontFamilyPreference,
  LatexFontShapeValue,
  FontValueType,
  type LatexFontSeries,
  type LatexFontShape,
  type LatexFontFamily,
  type LatexFontMeasurementValue,
  type LatexFontMeasurement,
} from "../types";

// TODO: Make these into a generic function

function createFontSeries(width: LatexFontWidth, weight: LatexFontWeight): LatexFontSeries {
  return {
    type: FontValueType.FontValue,
    value: {
      width,
      weight,
    },
  };
}

function createFontFamily(preference: LatexFontFamilyPreference): LatexFontFamily {
  return {
    type: FontValueType.FontValue,
    value: preference,
  };
}

function createFontShape(shape: LatexFontShapeValue): LatexFontShape {
  return {
    type: FontValueType.FontValue,
    value: shape,
  };
}

function createFontSize(size: LatexFontMeasurementValue): LatexFontMeasurement {
  return {
    type: FontValueType.FontValue,
    value: size,
  };
}

export function parseAuthorCommand(authorCommand: string): LatexFont | null {
  // Source: https://www.latex-project.org/help/documentation/fntguide.pdf
  switch (authorCommand) {
    case "normalfont":
    case "textnormal":
      return {
        shape: createFontShape(LatexFontShapeValue.Normal),
        series: createFontSeries(LatexFontWidth.Medium, LatexFontWeight.Medium),
        family: createFontFamily(LatexFontFamilyPreference.PrefersSerif),
      };
    case "textrm":
    case "rmfamily":
      return { family: createFontFamily(LatexFontFamilyPreference.PrefersSerif) };
    case "textsf":
    case "sffamily":
      return { family: createFontFamily(LatexFontFamilyPreference.PrefersSansSerif) };
    case "texttt":
    case "ttfamily":
      return { family: createFontFamily(LatexFontFamilyPreference.PrefersMonospace) };
    case "textmd":
    case "mdseries":
      return { series: createFontSeries(LatexFontWidth.Medium, LatexFontWeight.Medium) };
    case "bfseries":
    case "textbf":
      return { series: createFontSeries(LatexFontWidth.Expanded, LatexFontWeight.Bold) };
    case "textit":
    case "itshape":
      return { shape: createFontShape(LatexFontShapeValue.Italic) };
    case "textsl":
    case "slshape":
      return { shape: createFontShape(LatexFontShapeValue.Oblique) };
    case "textsc":
    case "scshape":
      return { shape: createFontShape(LatexFontShapeValue.CapsAndSmallCaps) };
    case "textssc":
    case "sscshape":
      return { shape: createFontShape(LatexFontShapeValue.SpacedCapsAndSmallCaps) };
    case "textsw":
    case "swshape":
      return { shape: createFontShape(LatexFontShapeValue.Swash) };
    case "textulc":
    case "ulcshape":
    case "textup":
    case "upshape":
      // ULC and UP shape author commands not supported since I do not know what they mean.
      return null;
    case "tiny":
      return { size: createFontSize({ value: 5, unit: LatexFontSizeUnit.Point }) };
    case "scriptsize":
      return { size: createFontSize({ value: 7, unit: LatexFontSizeUnit.Point }) };
    case "footnotesize":
      return { size: createFontSize({ value: 8, unit: LatexFontSizeUnit.Point }) };
    case "normalsize":
      return { size: createFontSize({ value: 10, unit: LatexFontSizeUnit.Point }) };
    case "large":
      return { size: createFontSize({ value: 12, unit: LatexFontSizeUnit.Point }) };
    case "Large":
      return { size: createFontSize({ value: 14.4, unit: LatexFontSizeUnit.Point }) };
    case "LARGE":
      return { size: createFontSize({ value: 17.28, unit: LatexFontSizeUnit.Point }) };
    case "huge":
      return { size: createFontSize({ value: 20.74, unit: LatexFontSizeUnit.Point }) };
    case "Huge":
      return { size: createFontSize({ value: 24.88, unit: LatexFontSizeUnit.Point }) };
    default:
      return null;
  }
}
