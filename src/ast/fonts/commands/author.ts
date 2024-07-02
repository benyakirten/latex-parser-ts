import {
  type LatexFont,
  LatexFontShape,
  LatexFontWidth,
  LatexFontWeight,
  LatexFontSizeUnit,
} from "../types";

export function parseAuthorCommand(authorCommand: string): LatexFont | null {
  // Source: https://www.latex-project.org/help/documentation/fntguide.pdf
  switch (authorCommand) {
    case "normalfont":
    case "textnormal":
      return {
        shape: LatexFontShape.Normal,
        width: LatexFontWidth.Medium,
        family: "prefers-serif",
      };
    case "textrm":
    case "rmfamily":
      return { family: "prefers-serif" };
    case "textsf":
    case "sffamily":
      return { family: "prefers-sans" };
    case "texttt":
    case "ttfamily":
      return { family: "prefers-monospace" };
    case "textmd":
    case "mdseries":
      return { weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium };
    case "bfseries":
    case "textbf":
      return { weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded };
    case "textit":
    case "itshape":
      return { shape: LatexFontShape.Italic };
    case "textsl":
    case "slshape":
      return { shape: LatexFontShape.Oblique };
    case "textsc":
    case "scshape":
      return { shape: LatexFontShape.CapsAndSmallCaps };
    case "textssc":
    case "sscshape":
      return { shape: LatexFontShape.SpacedCapsAndSmallCaps };
    case "textsw":
    case "swshape":
      return { shape: LatexFontShape.Swash };
    case "textulc":
    case "ulcshape":
    case "textup":
    case "upshape":
      // ULC and UP shape author commands not supported since I do not know what they mean.
      return null;
    case "tiny":
      return { size: { value: 5, unit: LatexFontSizeUnit.Point } };
    case "scriptsize":
      return { size: { value: 7, unit: LatexFontSizeUnit.Point } };
    case "footnotesize":
      return { size: { value: 8, unit: LatexFontSizeUnit.Point } };
    case "normalsize":
      return { size: { value: 10, unit: LatexFontSizeUnit.Point } };
    case "large":
      return { size: { value: 12, unit: LatexFontSizeUnit.Point } };
    case "Large":
      return { size: { value: 14.4, unit: LatexFontSizeUnit.Point } };
    case "LARGE":
      return { size: { value: 17.28, unit: LatexFontSizeUnit.Point } };
    case "huge":
      return { size: { value: 20.74, unit: LatexFontSizeUnit.Point } };
    case "Huge":
      return { size: { value: 24.88, unit: LatexFontSizeUnit.Point } };
    default:
      return null;
  }
}
