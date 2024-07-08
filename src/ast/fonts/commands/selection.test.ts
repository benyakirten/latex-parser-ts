import { expect, describe, test, it } from "bun:test";

import { parseSelectionCommandSections, parseUseFont } from "./selection";
import {
  LatexFontWeight,
  LatexFontWidth,
  LatexFontSizeUnit,
  LatexFontEncodingType,
  LatexFontEncodingNormalValue,
  LatexFontShapeValue,
  type LatexFont,
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
        shape: LatexFontShapeValue.Italic,
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
    "\\fontfamily{}\\selectfont",
    "\\fontsize{12none}{12}\\selectfont",
    "\\fontsize{none}{12}\\selectfont",
  ])("should throw an error for an input of %s", (input) => {
    const lexer = new LatexLexer(input);
    expect(() => parseSelectionCommandSections(lexer)).toThrow();
  });
});

describe("parseUseFont", () => {
  it("should parse the encoding, family, weight, width and shape of a font", () => {
    const lexer = new LatexLexer("\\usefont{oml}{ptm}{sluc}{it}");
    const got = parseUseFont(lexer);
    expect(got).toEqual({
      encoding: {
        type: LatexFontEncodingType.Normal,
        encoding: LatexFontEncodingNormalValue.MathItalic,
      },
      family: "ptm",
      weight: LatexFontWeight.SemiLight,
      width: LatexFontWidth.UltraCondensed,
      shape: LatexFontShape.Italic,
    });
  });

  it("should throw if the command is not recognized", () => {
    const lexer = new LatexLexer("\\fontstuff{oml}{ptm}{sluc}{it}");
    expect(() => parseUseFont(lexer)).toThrow();
  });

  it("should throw if less than four arguments are provided", () => {
    const lexer = new LatexLexer("\\usefont{oml}{ptm}{sluc}");
    expect(() => parseUseFont(lexer)).toThrow();
  });

  it("should throw if any of the arguments cannot be parsed", () => {
    let lexer = new LatexLexer("\\usefont{oml}{ptm}{sluc}{unknown}");
    expect(() => parseUseFont(lexer)).toThrow();

    lexer = new LatexLexer("\\usefont{oml}{ptm}{}{it}");
    expect(() => parseUseFont(lexer)).toThrow();

    lexer = new LatexLexer("\\usefont{oml}{}{sluc}{it}");
    expect(() => parseUseFont(lexer)).toThrow();

    lexer = new LatexLexer("\\usefont{unknown}{ptm}{sluc}{it}");
    expect(() => parseUseFont(lexer)).toThrow();
  });
});
