import { expect, describe, test } from "bun:test";

import { parseAuthorCommand } from "./author";
import {
  FontValueType,
  LatexFontFamilyPreference,
  LatexFontShapeValue,
  LatexFontSizeUnit,
  LatexFontWeight,
  LatexFontWidth,
  type LatexFont,
} from "../types";

describe("parseAuthorCommand", () => {
  test.each<[LatexFont | null, string]>([
    [null, "unknown"],
    [
      {
        shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Normal },
        series: {
          type: FontValueType.FontValue,
          value: { width: LatexFontWidth.Medium, weight: LatexFontWeight.Medium },
        },
        family: { type: FontValueType.FontValue, value: LatexFontFamilyPreference.PrefersSerif },
      },
      "textnormal",
    ],
    [
      {
        shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Normal },
        series: {
          type: FontValueType.FontValue,
          value: { width: LatexFontWidth.Medium, weight: LatexFontWeight.Medium },
        },
        family: { type: FontValueType.FontValue, value: LatexFontFamilyPreference.PrefersSerif },
      },
      "normalfont",
    ],
    [
      { family: { type: FontValueType.FontValue, value: LatexFontFamilyPreference.PrefersSerif } },
      "textrm",
    ],
    [
      { family: { type: FontValueType.FontValue, value: LatexFontFamilyPreference.PrefersSerif } },
      "rmfamily",
    ],
    [
      {
        family: {
          type: FontValueType.FontValue,
          value: LatexFontFamilyPreference.PrefersSansSerif,
        },
      },
      "textsf",
    ],
    [
      {
        family: {
          type: FontValueType.FontValue,
          value: LatexFontFamilyPreference.PrefersSansSerif,
        },
      },
      "sffamily",
    ],
    [
      {
        family: {
          type: FontValueType.FontValue,
          value: LatexFontFamilyPreference.PrefersMonospace,
        },
      },
      "texttt",
    ],
    [
      {
        family: {
          type: FontValueType.FontValue,
          value: LatexFontFamilyPreference.PrefersMonospace,
        },
      },
      "ttfamily",
    ],
    [
      {
        series: {
          type: FontValueType.FontValue,
          value: { weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium },
        },
      },
      "textmd",
    ],
    [
      {
        series: {
          type: FontValueType.FontValue,
          value: { weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium },
        },
      },
      "mdseries",
    ],
    [
      {
        series: {
          type: FontValueType.FontValue,
          value: { weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded },
        },
      },
      "textbf",
    ],
    [
      {
        series: {
          type: FontValueType.FontValue,
          value: { weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded },
        },
      },
      "bfseries",
    ],
    [{ shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Italic } }, "textit"],
    [{ shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Italic } }, "itshape"],
    [{ shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Oblique } }, "textsl"],
    [{ shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Oblique } }, "slshape"],
    [{ shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Swash } }, "textsw"],
    [{ shape: { type: FontValueType.FontValue, value: LatexFontShapeValue.Swash } }, "swshape"],
    [null, "textulc"],
    [null, "ulcshape"],
    [null, "textup"],
    [null, "upshape"],
    [
      {
        size: { type: FontValueType.FontValue, value: { value: 5, unit: LatexFontSizeUnit.Point } },
      },
      "tiny",
    ],
    [
      {
        size: { type: FontValueType.FontValue, value: { value: 7, unit: LatexFontSizeUnit.Point } },
      },
      "scriptsize",
    ],
    [
      {
        size: { type: FontValueType.FontValue, value: { value: 8, unit: LatexFontSizeUnit.Point } },
      },
      "footnotesize",
    ],
    [
      {
        size: {
          type: FontValueType.FontValue,
          value: { value: 10, unit: LatexFontSizeUnit.Point },
        },
      },
      "normalsize",
    ],
    [
      {
        size: {
          type: FontValueType.FontValue,
          value: { value: 12, unit: LatexFontSizeUnit.Point },
        },
      },
      "large",
    ],
    [
      {
        size: {
          type: FontValueType.FontValue,
          value: { value: 14.4, unit: LatexFontSizeUnit.Point },
        },
      },
      "Large",
    ],
    [
      {
        size: {
          type: FontValueType.FontValue,
          value: { value: 17.28, unit: LatexFontSizeUnit.Point },
        },
      },
      "LARGE",
    ],
    [
      {
        size: {
          type: FontValueType.FontValue,
          value: { value: 20.74, unit: LatexFontSizeUnit.Point },
        },
      },
      "huge",
    ],
    [
      {
        size: {
          type: FontValueType.FontValue,
          value: { value: 24.88, unit: LatexFontSizeUnit.Point },
        },
      },
      "Huge",
    ],
  ])("should return %o given %s", (want, input) => {
    const got = parseAuthorCommand(input);
    expect(got).toEqual(want);
  });
});
