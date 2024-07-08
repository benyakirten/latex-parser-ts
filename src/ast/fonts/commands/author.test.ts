import { expect, describe, test } from "bun:test";

import { parseAuthorCommand } from "./author";
import { AuthorCommandType, FontValueType, LatexFontSizeUnit, type AuthorCommand } from "../types";

describe("parseAuthorCommand", () => {
  test.each<[AuthorCommand | null, string]>([
    [null, "unknown"],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "normal",
      },
      "textnormal",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "normal",
      },
      "textnormal",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "normal",
      },
      "normalfont",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "serif",
      },
      "textrm",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "serif",
      },
      "rmfamily",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "sans",
      },
      "textsf",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "sans",
      },
      "sffamily",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "monospace",
      },
      "texttt",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "monospace",
      },
      "ttfamily",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "medium",
      },
      "textmd",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "medium",
      },
      "mdseries",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "bold",
      },
      "textbf",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "bold",
      },
      "bfseries",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "italics",
      },
      "textit",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "italics",
      },
      "itshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "oblique",
      },
      "textsl",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "oblique",
      },
      "slshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "swash",
      },
      "textsw",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "swash",
      },
      "swshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "lowercase",
      },
      "textulc",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "lowercase",
      },
      "ulcshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "upcase",
      },
      "textup",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "upcase",
      },
      "upshape",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 5, unit: LatexFontSizeUnit.Point },
        },
      },
      "tiny",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 7, unit: LatexFontSizeUnit.Point },
        },
      },
      "scriptsize",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 8, unit: LatexFontSizeUnit.Point },
        },
      },
      "footnotesize",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 10, unit: LatexFontSizeUnit.Point },
        },
      },
      "normalsize",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 12, unit: LatexFontSizeUnit.Point },
        },
      },
      "large",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 14.4, unit: LatexFontSizeUnit.Point },
        },
      },
      "Large",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 17.28, unit: LatexFontSizeUnit.Point },
        },
      },
      "LARGE",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 20.74, unit: LatexFontSizeUnit.Point },
        },
      },
      "huge",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
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
