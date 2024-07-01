import {
  LatexFontEncodingNormalValue,
  LatexFontEncodingType,
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
