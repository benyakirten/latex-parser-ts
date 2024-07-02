import { expect, describe, test } from "bun:test";

import { parseSelectionCommandSections } from "./selection";
import {
  LatexFontWeight,
  LatexFontWidth,
  LatexFontShape,
  LatexFontSizeUnit,
  LatexFontEncodingType,
  type LatexFont,
  LatexFontEncodingNormalValue,
} from "../types";
import { LatexLexer } from "../../../lexer/lexer";

describe("parseSelectionCommandSections", () => {
  test.each<[LatexFont, string]>([
    [
      {
        encoding: {
          type: LatexFontEncodingType.Local,
          encoding: "lt1",
        },
        family: "ptm",
        size: {
          value: 10,
          unit: LatexFontSizeUnit.Inch,
        },
        baselineSkip: {
          value: 12,
          unit: LatexFontSizeUnit.Point,
        },
        weight: LatexFontWeight.SemiLight,
        width: LatexFontWidth.UltraCondensed,
        shape: LatexFontShape.Italic,
        lineSpread: 1.5,
      },
      "\\fontfamily{ptm}\\fontseries{sluc}\\fontencoding{lt1}\\fontshape{it}\\fontsize{10in}{12}\\linespread{1.5}\\selectfont",
    ],
    [
      {
        encoding: {
          type: LatexFontEncodingType.Normal,
          encoding: LatexFontEncodingNormalValue.MathItalic,
        },
        size: {
          value: 11,
          unit: LatexFontSizeUnit.Point,
        },
        baselineSkip: {
          value: 13,
          unit: LatexFontSizeUnit.Ex,
        },
      },
      "\\fontencoding{oml}\\fontsize{11}{13ex}\\selectfont",
    ],
  ])("should return $o for an input of %s", (want, input) => {
    const lexer = new LatexLexer(input);
    const got = parseSelectionCommandSections(lexer);
    expect(got).toEqual(want);
  });

  test.each<string>([
    "\\documentstart",
    " \\fontencoding{oml}\\fontsize{11}{13ex}\\selectfont",
    "\\fontencoding{oml}\\fontsize{11}{13ex}",
    "\\fontencoding{none}\\selectfont",
    "\\fontshape{none}\\selectfont",
    "\\fontsize{12none}{12}\\selectfont",
    "\\fontsize{none}{12}\\selectfont",
  ])("should throw an error for an input of %s", (input) => {
    const lexer = new LatexLexer(input);
    expect(() => parseSelectionCommandSections(lexer)).toThrow();
  });
});
