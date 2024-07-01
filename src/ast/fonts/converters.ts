import {
  FontSelectionType,
  LatexFontShape,
  LatexFontSizeUnit,
  LatexFontWeight,
  LatexFontWidth,
  type LatexFont,
  type SelectionCommand,
} from "./types";

export function parseAuthorCommand(authorCommand: string): LatexFont | null {
  const parsedCommand = getAuthorCommandText(authorCommand);

  // Source: https://www.latex-project.org/help/documentation/fntguide.pdf
  switch (parsedCommand) {
    case "normal":
    case "md":
      return { shape: LatexFontShape.Normal, width: LatexFontWidth.Medium };
    case "rm":
      // Want serif font family
      return null;
    case "sf":
      // Want sans-serif font family
      return null;
    case "tt":
      // Want monospace family
      return null;
    case "bf":
      return { weight: LatexFontWeight.Bold, width: LatexFontWidth.Expanded };
    case "it":
      return { shape: LatexFontShape.Italic };
    case "sl":
      return { shape: LatexFontShape.Slanted };
    case "sc":
      return { shape: LatexFontShape.CapsAndSmallCaps };
    case "ssc":
      return { shape: LatexFontShape.SpacedCapsAndSmallCaps };
    case "sw":
      return { shape: LatexFontShape.Swash };
    case "ulc":
    case "up":
      // TODO: Figure out what these mean
      console.error("ULC and UP author commands not supported");
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

function getAuthorCommandText(authorCommand: string): string {
  if (authorCommand.startsWith("text")) {
    const got = authorCommand.split("text");
    return got[1];
  }

  for (const command of ["family", "series", "shape"]) {
    if (authorCommand.endsWith(command)) {
      const got = authorCommand.split(command);
      return got[1];
    }
  }

  return authorCommand;
}

/**
 * Command should be the whole command, e.g. fontencoding
 */
export function parseSelectionCommand(fontCommands: SelectionCommand[]): LatexFont {
  const parsedCommand: LatexFont = {};
  for (const command of fontCommands) {
    switch (command.type) {
      case FontSelectionType.Encoding:
      case FontSelectionType.Family:
      case FontSelectionType.Series:
      case FontSelectionType.Shape:
      case FontSelectionType.Size:
      case FontSelectionType.LineSpread:
    }
  }

  return parsedCommand;
}
