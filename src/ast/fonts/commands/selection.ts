import type { LatexLexer } from "../../lexer/lexer";
import { TokenType } from "../../lexer/types";
import { SelectionCommandType, type LatexFont, type SelectionCommand } from "./types";
import { parseFontEncoding, parseFontMeasurement, parseFontSeries, parseFontShape } from "./utils";

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
  const encoding = parseFontEncoding(rawCommand);

  return {
    type: SelectionCommandType.Encoding,
    encoding,
  };
}

function parseFontFamilyCommand(lexer: LatexLexer): SelectionCommand {
  const family = getContentWrappedByBraces(lexer);
  return {
    type: SelectionCommandType.Family,
    family,
  };
}

function parseFontSeriesCommand(lexer: LatexLexer): SelectionCommand {
  const rawSeries = getContentWrappedByBraces(lexer);
  const { width, weight } = parseFontSeries(rawSeries);
  return {
    type: SelectionCommandType.Series,
    width,
    weight,
  };
}

function parseFontShapeCommand(lexer: LatexLexer): SelectionCommand {
  const rawShape = getContentWrappedByBraces(lexer);
  const shape = parseFontShape(rawShape);
  return {
    type: SelectionCommandType.Shape,
    shape,
  };
}

function parseFontSizeCommand(lexer: LatexLexer): SelectionCommand {
  const rawFontSize = getContentWrappedByBraces(lexer);
  const rawBaselineskip = getContentWrappedByBraces(lexer);

  const fontSize = parseFontMeasurement(rawFontSize);
  const baselineskip = parseFontMeasurement(rawBaselineskip);

  return {
    type: SelectionCommandType.Size,
    size: fontSize,
    baselineskip,
  };
}

function parseFontLinespreadCommand(lexer: LatexLexer): SelectionCommand {
  const rawLineSpread = getContentWrappedByBraces(lexer);
  const lineSpread = parseFloat(rawLineSpread);
  return {
    type: SelectionCommandType.LineSpread,
    value: lineSpread,
  };
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

  return parseSelectionCommands(selectionCommands);
}
