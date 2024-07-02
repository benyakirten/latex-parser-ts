import { expect, describe, test } from "bun:test";

import { parseAuthorCommand } from "./author";
import { LatexFontShape, LatexFontSizeUnit, LatexFontWeight, LatexFontWidth } from "../types";

describe("parseAuthorCommand", () => {
  test.each([
    [null, "unknown"],
    [
      { shape: LatexFontShape.Normal, width: LatexFontWidth.Medium, family: "prefers-serif" },
      "textnormal",
    ],
    [
      { shape: LatexFontShape.Normal, width: LatexFontWidth.Medium, family: "prefers-serif" },
      "normalfont",
    ],
    [{ family: "prefers-serif" }, "textrm"],
    [{ family: "prefers-serif" }, "rmfamily"],
    [{ family: "prefers-sans" }, "textsf"],
    [{ family: "prefers-sans" }, "sffamily"],
    [{ family: "prefers-monospace" }, "texttt"],
    [{ family: "prefers-monospace" }, "ttfamily"],
    [{ weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium }, "textmd"],
    [{ weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium }, "mdseries"],
    [{ weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded }, "textbf"],
    [{ weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded }, "bfseries"],
    [{ shape: LatexFontShape.Italic }, "textit"],
    [{ shape: LatexFontShape.Italic }, "itshape"],
    [{ shape: LatexFontShape.Oblique }, "textsl"],
    [{ shape: LatexFontShape.Oblique }, "slshape"],
    [{ shape: LatexFontShape.Swash }, "textsw"],
    [{ shape: LatexFontShape.Swash }, "swshape"],
    [null, "textulc"],
    [null, "ulcshape"],
    [null, "textup"],
    [null, "upshape"],
    [{ size: { value: 5, unit: LatexFontSizeUnit.Point } }, "tiny"],
    [{ size: { value: 7, unit: LatexFontSizeUnit.Point } }, "scriptsize"],
    [{ size: { value: 8, unit: LatexFontSizeUnit.Point } }, "footnotesize"],
    [{ size: { value: 10, unit: LatexFontSizeUnit.Point } }, "normalsize"],
    [{ size: { value: 12, unit: LatexFontSizeUnit.Point } }, "large"],
    [{ size: { value: 14.4, unit: LatexFontSizeUnit.Point } }, "Large"],
    [{ size: { value: 17.28, unit: LatexFontSizeUnit.Point } }, "LARGE"],
    [{ size: { value: 20.74, unit: LatexFontSizeUnit.Point } }, "huge"],
    [{ size: { value: 24.88, unit: LatexFontSizeUnit.Point } }, "Huge"],
  ])("should return %o given %s", (want, input) => {
    const got = parseAuthorCommand(input);
    expect(got).toEqual(want);
  });
});
