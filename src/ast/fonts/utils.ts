import {
  LatexFontEncodingNormalValue,
  LatexFontEncodingType,
  LatexFontShapeValue,
  LatexFontSizeUnit,
  LatexFontWeightValue,
  LatexFontWidthValue,
  type LatexFontEncoding,
  type LatexFontEncodingLocal,
  type LatexFontMeasurement,
  type LatexFontSeriesValue,
} from "./types";

export function parseFontEncoding(rawCommand: string): LatexFontEncoding {
  if (rawCommand.toLocaleUpperCase().startsWith("L")) {
    const fontEncoding: LatexFontEncodingLocal = {
      type: LatexFontEncodingType.Local,
      encoding: rawCommand,
    };

    return fontEncoding;
  }

  let encoding: LatexFontEncodingNormalValue;

  switch (rawCommand.toLocaleUpperCase()) {
    case "OT1":
      encoding = LatexFontEncodingNormalValue.KnuthTexText;
      break;
    case "T1":
      encoding = LatexFontEncodingNormalValue.ExtendedText;
      break;
    case "OML":
      encoding = LatexFontEncodingNormalValue.MathItalic;
      break;
    case "OMS":
      encoding = LatexFontEncodingNormalValue.MathSymbols;
      break;
    case "OMX":
      encoding = LatexFontEncodingNormalValue.MathLargeSymbols;
      break;
    case "U":
      encoding = LatexFontEncodingNormalValue.Unknown;
      break;
    default:
      throw new Error(`Unrecognized encoding value: ${rawCommand}`);
  }

  const fontEncoding = {
    type: LatexFontEncodingType.Normal,
    encoding,
  };

  return fontEncoding;
}

export function parseFontFamily(rawCommand: string): string {
  if (!rawCommand) {
    throw new Error("Font family is empty");
  }
  return rawCommand;
}

const FONT_SERIES_RE = /^([ues]?[lb])?([ues]?[cx])?$/;
// TODO: Decide error handling and unknown values.
export function parseFontSeries(rawCommand: string): LatexFontSeriesValue {
  const series = { weight: LatexFontWeightValue.Medium, width: LatexFontWidthValue.Medium };
  if (rawCommand === "m") {
    return series;
  }

  const matches = rawCommand.match(FONT_SERIES_RE);
  if (!matches || matches.length !== 3) {
    return series;
  }

  const [_, rawWeight, rawWidth] = matches;

  if (!rawWeight && !rawWidth) {
    throw new Error(`Both weight and width are not reecognized: ${rawCommand}`);
  }

  if (rawWeight) {
    switch (rawWeight.toLocaleLowerCase()) {
      case "ul":
        series.weight = LatexFontWeightValue.UltraLight;
        break;
      case "el":
        series.weight = LatexFontWeightValue.ExtraLight;
        break;
      case "l":
        series.weight = LatexFontWeightValue.Light;
        break;
      case "sl":
        series.weight = LatexFontWeightValue.SemiLight;
        break;
      case "sb":
        series.weight = LatexFontWeightValue.SemiBold;
        break;
      case "b":
        series.weight = LatexFontWeightValue.Bold;
        break;
      case "eb":
        series.weight = LatexFontWeightValue.ExtraBold;
        break;
      case "ub":
        series.weight = LatexFontWeightValue.UltraBold;
        break;
      default:
        throw new Error(`Unrecognized weight: ${rawWeight}`);
    }
  }

  if (rawWidth) {
    switch (rawWidth.toLocaleLowerCase()) {
      case "uc":
        series.width = LatexFontWidthValue.UltraCondensed;
        break;
      case "ec":
        series.width = LatexFontWidthValue.ExtraCondensed;
        break;
      case "c":
        series.width = LatexFontWidthValue.Condensed;
        break;
      case "sc":
        series.width = LatexFontWidthValue.SemiCondensed;
        break;
      case "sx":
        series.width = LatexFontWidthValue.SemiExpanded;
        break;
      case "x":
        series.width = LatexFontWidthValue.Expanded;
        break;
      case "ex":
        series.width = LatexFontWidthValue.ExtraExpanded;
        break;
      case "ux":
        series.width = LatexFontWidthValue.UltraExpanded;
        break;
      default:
        throw new Error(`Unrecognized width: ${rawWidth}`);
    }
  }

  return series;
}

export function parseFontShape(rawCommand: string): LatexFontShapeValue {
  switch (rawCommand.toLocaleLowerCase()) {
    case "n":
      return LatexFontShapeValue.Normal;
    case "it":
      return LatexFontShapeValue.Italic;
    case "sl":
      return LatexFontShapeValue.Oblique;
    case "sc":
      return LatexFontShapeValue.CapsAndSmallCaps;
    case "scit":
      return LatexFontShapeValue.CapsAndSmallCapsItalics;
    case "scsl":
      return LatexFontShapeValue.CapsAndSmallCapsOblique;
    case "sw":
      return LatexFontShapeValue.Swash;
    case "ssc":
      return LatexFontShapeValue.SpacedCapsAndSmallCaps;
    case "ui":
      return LatexFontShapeValue.UprightItalic;
    default:
      throw new Error(`Unrecognized font shape: ${rawCommand}`);
  }
}

/**
 * Three capture groups: (initla digit)(.followingdigits)(unit)
 * If the unit is not present, it is assumed to be pt.
 */
const FONT_SIZE_RE =
  /^([0-9]+)(\.[0-9]+)?(pt|mm|cm|in|ex|em|mu|sp|vmin|vmax|vh|vw|cc|bp|dd|pc|px)?$/;
export function parseFontMeasurement(rawMeasurement: string): LatexFontMeasurement {
  const matches = rawMeasurement.match(FONT_SIZE_RE);
  if (!matches || matches.length !== 4) {
    throw new Error(`Unrecognized font measurement: ${rawMeasurement}`);
  }

  const [_, rawValue, rawFloatPoint, rawUnit] = matches;
  const floatingPoint = rawFloatPoint || ".0";
  const value = parseFloat(`${rawValue}${floatingPoint}`);

  const unit = parseFontSizeUnit(rawUnit);

  return { value, unit };
}

function parseFontSizeUnit(rawUnit?: string): LatexFontSizeUnit {
  switch (rawUnit) {
    case "in":
      return LatexFontSizeUnit.Inch;
    case "mm":
      return LatexFontSizeUnit.Millimeter;
    case "cm":
      return LatexFontSizeUnit.Centimeter;
    case "pc":
      return LatexFontSizeUnit.Pica;
    case "dd":
      return LatexFontSizeUnit.DidotPoint;
    case "cc":
      return LatexFontSizeUnit.Cicero;
    case "sp":
      return LatexFontSizeUnit.ScaledPoint;
    case "bp":
      return LatexFontSizeUnit.BigPoint;
    case "em":
      return LatexFontSizeUnit.Em;
    case "ex":
      return LatexFontSizeUnit.Ex;
    case "mu":
      return LatexFontSizeUnit.Mu;
    case "px":
      return LatexFontSizeUnit.Pixel;
    case "vh":
      return LatexFontSizeUnit.ViewportHeight;
    case "vw":
      return LatexFontSizeUnit.ViewportWidth;
    case "vmin":
      return LatexFontSizeUnit.ViewportMin;
    case "vmax":
      return LatexFontSizeUnit.ViewportMax;
    case "pt":
    default:
      return LatexFontSizeUnit.Point;
  }
}
