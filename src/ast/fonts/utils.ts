import {
  LatexFontEncodingNormalValue,
  LatexFontEncodingType,
  LatexFontWeight,
  LatexFontWidth,
  type LatexFontEncoding,
  type LatexFontEncodingLocal,
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

const FONT_SERIES_RE = /^([ues]?[lb])?([ues]?[cx])?$/;
// TODO: Decide error handling and unknown values.
export function parseFontSeries(rawCommand: string): {
  weight: LatexFontWeight;
  width: LatexFontWidth;
} {
  const series = { weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium };

  const matches = rawCommand.match(FONT_SERIES_RE);
  if (!matches || matches.length !== 3) {
    return series;
  }

  const rawWeight = matches[1];
  const rawWidth = matches[2];

  switch (rawWeight) {
    case "ul":
      series.weight = LatexFontWeight.UltraLight;
      break;
    case "el":
      series.weight = LatexFontWeight.ExtraLight;
      break;
    case "l":
      series.weight = LatexFontWeight.Light;
      break;
    case "sl":
      series.weight = LatexFontWeight.SemiLight;
      break;
    case "sb":
      series.weight = LatexFontWeight.SemiBold;
      break;
    case "b":
      series.weight = LatexFontWeight.Bold;
      break;
    case "eb":
      series.weight = LatexFontWeight.ExtraBold;
      break;
    case "ub":
      series.weight = LatexFontWeight.UltraBold;
      break;
    case undefined:
      break;
    default:
      throw new Error(`Unrecognized weight: ${rawWeight}`);
  }

  switch (rawWidth) {
    case "uc":
      series.width = LatexFontWidth.UltraCondensed;
      break;
    case "ec":
      series.width = LatexFontWidth.ExtraCondensed;
      break;
    case "c":
      series.width = LatexFontWidth.Condensed;
      break;
    case "sc":
      series.width = LatexFontWidth.SemiCondensed;
      break;
    case "sx":
      series.width = LatexFontWidth.SemiExpanded;
      break;
    case "x":
      series.width = LatexFontWidth.Expanded;
      break;
    case "ex":
      series.width = LatexFontWidth.ExtraExpanded;
      break;
    case "ux":
      series.width = LatexFontWidth.UltraExpanded;
      break;
    case undefined:
      break;
    default:
      throw new Error(`Unrecognized width: ${rawWidth}`);
  }

  return series;
}
