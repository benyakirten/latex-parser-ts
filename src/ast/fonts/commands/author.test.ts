import { expect, describe, test } from "bun:test";

import { parseAuthorCommand } from "./author";
import { LatexFontShape, LatexFontSizeUnit, LatexFontWeight, LatexFontWidth } from "../types";

describe("parseAuthorCommand", () => {
  test.each([
    {
      want: null,
      input: "unknown",
    },
    {
      want: { shape: LatexFontShape.Normal, width: LatexFontWidth.Medium, family: "prefers-serif" },
      input: "textnormal",
    },
    {
      want: { shape: LatexFontShape.Normal, width: LatexFontWidth.Medium, family: "prefers-serif" },
      input: "normalfont",
    },
    {
      want: { family: "prefers-serif" },
      input: "textrm",
    },
    {
      want: { family: "prefers-serif" },
      input: "rmfamily",
    },
    {
      want: { family: "prefers-sans" },
      input: "textsf",
    },
    {
      want: { family: "prefers-sans" },
      input: "sffamily",
    },
    {
      want: { family: "prefers-monospace" },
      input: "texttt",
    },
    {
      want: { family: "prefers-monospace" },
      input: "ttfamily",
    },
    {
      want: { weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium },
      input: "textmd",
    },
    {
      want: { weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium },
      input: "mdseries",
    },
    {
      want: { weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded },
      input: "textbf",
    },
    {
      want: { weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded },
      input: "bfseries",
    },
    {
      want: { shape: LatexFontShape.Italic },
      input: "textit",
    },
    {
      want: { shape: LatexFontShape.Italic },
      input: "itshape",
    },
    {
      want: { shape: LatexFontShape.Oblique },
      input: "textsl",
    },
    {
      want: { shape: LatexFontShape.Oblique },
      input: "slshape",
    },
    {
      want: { shape: LatexFontShape.Swash },
      input: "textsw",
    },
    {
      want: { shape: LatexFontShape.Swash },
      input: "swshape",
    },
    {
      want: null,
      input: "textulc",
    },
    {
      want: null,
      input: "ulcshape",
    },
    {
      want: null,
      input: "textup",
    },
    {
      want: null,
      input: "upshape",
    },
    { input: "tiny", want: { size: { value: 5, unit: LatexFontSizeUnit.Point } } },
    { input: "scriptsize", want: { size: { value: 7, unit: LatexFontSizeUnit.Point } } },
    { input: "footnotesize", want: { size: { value: 8, unit: LatexFontSizeUnit.Point } } },
    { input: "normalsize", want: { size: { value: 10, unit: LatexFontSizeUnit.Point } } },
    { input: "large", want: { size: { value: 12, unit: LatexFontSizeUnit.Point } } },
    { input: "Large", want: { size: { value: 14.4, unit: LatexFontSizeUnit.Point } } },
    { input: "LARGE", want: { size: { value: 17.28, unit: LatexFontSizeUnit.Point } } },
    { input: "huge", want: { size: { value: 20.74, unit: LatexFontSizeUnit.Point } } },
    { input: "Huge", want: { size: { value: 24.88, unit: LatexFontSizeUnit.Point } } },
  ])("should return $want given $input", ({ want, input }) => {
    const got = parseAuthorCommand(input);
    expect(got).toEqual(want);
  });
});
