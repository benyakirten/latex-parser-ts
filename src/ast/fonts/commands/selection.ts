import type { LatexLexer } from "../../../lexer/lexer";
import { LatexTokenType } from "../../../lexer/types";
import {
  SelectionCommandType,
  type LatexFont,
  type SelectionCommand,
  type SelectionCommandFontEncoding,
  type SelectionCommandFontFamily,
  type SelectionCommandFontLineSpread,
  type SelectionCommandFontSeries,
  type SelectionCommandFontShape,
  type SelectionCommandFontSize,
} from "../types";
import {
  parseFontEncoding,
  parseFontFamily,
  parseFontMeasurement,
  parseFontSeries,
  parseFontShape,
} from "../utils";

function parseSelectionCommands(selectionCommands: SelectionCommand[]): LatexFont {
  const latexFont: LatexFont = {};
  for (const command of selectionCommands) {
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
        latexFont.baselineSkip = command.baselineSkip;
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
  if (openBrace.type !== LatexTokenType.LBrace) {
    throw new Error("Expected {content}");
  }

  const encoding = lexer.nextToken();

  if (encoding.type !== LatexTokenType.Content) {
    throw new Error("Expected {content}");
  }

  const closeBrace = lexer.nextToken();
  if (closeBrace.type !== LatexTokenType.RBrace) {
    throw new Error("Expected {content}");
  }

  return encoding.literal;
}

function parseFontEncodingCommand(lexer: LatexLexer): SelectionCommandFontEncoding {
  const rawCommand = getContentWrappedByBraces(lexer);
  const encoding = parseFontEncoding(rawCommand);

  return {
    type: SelectionCommandType.Encoding,
    encoding,
  };
}

function parseFontFamilyCommand(lexer: LatexLexer): SelectionCommandFontFamily {
  const rawFamily = getContentWrappedByBraces(lexer);
  const family = parseFontFamily(rawFamily);
  return {
    type: SelectionCommandType.Family,
    family,
  };
}

function parseFontSeriesCommand(lexer: LatexLexer): SelectionCommandFontSeries {
  const rawSeries = getContentWrappedByBraces(lexer);
  const { width, weight } = parseFontSeries(rawSeries);
  return {
    type: SelectionCommandType.Series,
    width,
    weight,
  };
}

function parseFontShapeCommand(lexer: LatexLexer): SelectionCommandFontShape {
  const rawShape = getContentWrappedByBraces(lexer);
  const shape = parseFontShape(rawShape);
  return {
    type: SelectionCommandType.Shape,
    shape,
  };
}

function parseFontSizeCommand(lexer: LatexLexer): SelectionCommandFontSize {
  const rawFontSize = getContentWrappedByBraces(lexer);
  const rawBaselineskip = getContentWrappedByBraces(lexer);

  const fontSize = parseFontMeasurement(rawFontSize);
  const baselineSkip = parseFontMeasurement(rawBaselineskip);

  return {
    type: SelectionCommandType.Size,
    size: fontSize,
    baselineSkip,
  };
}

function parseFontLinespreadCommand(lexer: LatexLexer): SelectionCommandFontLineSpread {
  const rawLineSpread = getContentWrappedByBraces(lexer);
  const lineSpread = parseFloat(rawLineSpread);
  return {
    type: SelectionCommandType.LineSpread,
    value: lineSpread,
  };
}

function parseSelectionCommandSection(rawCommand: string, lexer: LatexLexer): SelectionCommand {
  switch (rawCommand.toLocaleLowerCase()) {
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

/** Expects the lexer to be at the backslash before the command name (e.g.. \fontsize) */
export function parseSelectionCommandSections(lexer: LatexLexer): LatexFont {
  const selectionCommands: SelectionCommand[] = [];
  while (true) {
    let token = lexer.nextToken();
    if (token.type !== LatexTokenType.BackSlash) {
      throw new Error("Expected font related command");
    }

    token = lexer.nextToken();
    if (token.type !== LatexTokenType.Content) {
      throw new Error("Expected font related command");
    }

    if (token.literal.toLocaleLowerCase() === "selectfont") {
      break;
    }

    const command = parseSelectionCommandSection(token.literal, lexer);
    selectionCommands.push(command);
  }

  return parseSelectionCommands(selectionCommands);
}

/** Expects the lexer to be at the backslash before the command name (e.g.. \usefont) */
export function parseUseFont(lexer: LatexLexer): LatexFont {
  let token = lexer.nextToken();
  if (token.type !== LatexTokenType.BackSlash) {
    throw new Error("Expected font related command");
  }

  token = lexer.nextToken();
  if (token.type !== LatexTokenType.Content) {
    throw new Error("Expected font related command");
  }

  const literal = token.literal.toLocaleLowerCase();
  if (literal !== "usefont") {
    throw new Error(`Expected usefont command name, received ${literal}`);
  }

  const encoding = parseFontEncodingCommand(lexer).encoding;
  const family = parseFontFamilyCommand(lexer).family;
  const { weight, width } = parseFontSeriesCommand(lexer);
  const shape = parseFontShapeCommand(lexer).shape;

  return { encoding, family, weight, width, shape };
}
