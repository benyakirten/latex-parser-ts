import type { LatexLexer } from "../../lexer/lexer";
import { TokenType } from "../../lexer/types";
import {
  SelectionCommandType,
  LatexFontEncodingNormalValue,
  LatexFontEncodingType,
  LatexFontShape,
  LatexFontSizeUnit,
  LatexFontWeight,
  LatexFontWidth,
  type LatexFont,
  type LatexFontEncodingLocal,
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
      return { family: "prefers-serif" };
    case "sf":
      return { family: "prefers-sans" };
    case "tt":
      return { family: "prefers-monospace" };
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

function parseSelectionCommand(fontCommands: SelectionCommand[]): LatexFont {
  const latexFont: LatexFont = {};
  for (const command of fontCommands) {
    switch (command.type) {
      case SelectionCommandType.Encoding:
        latexFont.encoding = command.encoding;
        break;
      case SelectionCommandType.Family:
        latexFont.family = command.family;
        break;
      case SelectionCommandType.Series:
        latexFont.weight = command.weight;
        latexFont.width = command.width;
        break;
      case SelectionCommandType.Shape:
        latexFont.shape = command.shape;
        break;
      case SelectionCommandType.Size:
        latexFont.size = command.size;
        latexFont.baselineskip = command.baselineskip;
        break;
      case SelectionCommandType.LineSpread:
        latexFont.lineSpread = command.value;
    }
  }

  return latexFont;
}

// TODO: Decide on error shape
function getContentWrappedByBraces(lexer: LatexLexer): string {
  const openBrace = lexer.nextToken();
  if (openBrace.type !== TokenType.LBrace) {
    throw new Error("Expected {content}");
  }

  const encoding = lexer.nextToken();
  if (encoding.type !== TokenType.Content) {
    throw new Error("Expected {content}");
  }

  const closeBrace = lexer.nextToken();
  if (closeBrace.type !== TokenType.RBrace) {
    throw new Error("Expected {content}");
  }

  return encoding.literal;
}

function parseFontEncodingCommand(lexer: LatexLexer): SelectionCommand {
  const rawCommand = getContentWrappedByBraces(lexer);
  let encoding: LatexFontEncodingNormalValue;

  if (rawCommand.toLocaleUpperCase().startsWith("L")) {
    const fontEncoding: LatexFontEncodingLocal = {
      type: LatexFontEncodingType.Local,
      encoding: rawCommand,
    };

    return {
      type: SelectionCommandType.Encoding,
      encoding: fontEncoding,
    };
  }

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

  return {
    type: SelectionCommandType.Encoding,
    encoding: fontEncoding,
  };
}

function parseFontFamilyCommand(lexer: LatexLexer): SelectionCommand {
  // TODO
}

function parseFontSeriesCommand(lexer: LatexLexer): SelectionCommand {
  // TODO
}

function parseFontShapeCommand(lexer: LatexLexer): SelectionCommand {
  // TODO
}

function parseFontSizeCommand(lexer: LatexLexer): SelectionCommand {
  // TODO
}

function parseFontLinespreadCommand(lexer: LatexLexer): SelectionCommand {
  // TODO
}

function parseSelectionCommandSection(rawCommand: string, lexer: LatexLexer): SelectionCommand {
  switch (rawCommand.toLowerCase()) {
    case "fontencoding":
      return parseFontEncodingCommand(lexer);
    case "fontfamily":
      return parseFontFamilyCommand(lexer);
    case "fontseries":
      return parseFontSeriesCommand(lexer);
    case "fontshape":
      return parseFontShapeCommand(lexer);
    case "fontsize":
      return parseFontSizeCommand(lexer);
    case "linespread":
      return parseFontLinespreadCommand(lexer);
    default:
      throw new Error("Unrecognized command");
  }
}

export function parseSelectionCommandSections(lexer: LatexLexer): LatexFont {
  // TODO:
  // 1. Parse tokens into selection commands
  // 2. Parse selection commands into a latex font

  const selectionCommands: SelectionCommand[] = [];
  while (true) {
    let token = lexer.nextToken();
    if (token.type !== TokenType.BackSlash) {
      throw new Error("Expected font related command");
    }

    token = lexer.nextToken();
    if (token.type !== TokenType.Content) {
      throw new Error("Expected font related command");
    }

    if (token.literal.toLocaleLowerCase() === "selectfont") {
      break;
    }

    const command = parseSelectionCommandSection(token.literal, lexer);
    selectionCommands.push(command);
  }

  return parseSelectionCommand(selectionCommands);
}
