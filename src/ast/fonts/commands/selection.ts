import {
  LatexCommandArgumentType,
  LatexTokenType,
  type CommandToken,
  type LatexToken,
} from "../../../lexer/types";
import {
  FontValueType,
  SelectionCommandType,
  type FontValue,
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
        latexFont.series = command.series;
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

function parseToFontValue<T>(token: LatexToken, callback: (value: string) => T): FontValue<T> {
  if (token.type === LatexTokenType.Command) {
    return {
      type: FontValueType.CommandToken,
      value: token,
    };
  }

  if (token.type === LatexTokenType.Content) {
    return {
      type: FontValueType.FontValue,
      value: callback(token.literal.trim()),
    };
  }

  throw new Error("Token type must be either a command or content token");
}

function testForOneRequiredArgument(token: CommandToken, type: string): LatexToken {
  if (
    token.arguments.length !== 1 ||
    token.arguments[0].type !== LatexCommandArgumentType.Required ||
    token.arguments[0].content.length !== 1
  ) {
    throw new Error(`Font ${type} requires one required argument with one item inside`);
  }

  return token.arguments[0].content[0];
}

function parseFontEncodingCommand(token: CommandToken): SelectionCommandFontEncoding {
  const encToken = testForOneRequiredArgument(token, "encoding");
  const encoding = parseToFontValue(encToken, parseFontEncoding);

  return {
    type: SelectionCommandType.Encoding,
    encoding,
  };
}

function parseFontFamilyCommand(token: CommandToken): SelectionCommandFontFamily {
  const familyToken = testForOneRequiredArgument(token, "family");
  const family = parseToFontValue(familyToken, parseFontFamily);
  return {
    type: SelectionCommandType.Family,
    family,
  };
}

function parseFontSeriesCommand(token: CommandToken): SelectionCommandFontSeries {
  const seriesToken = testForOneRequiredArgument(token, "series");
  const series = parseToFontValue(seriesToken, parseFontSeries);
  return {
    type: SelectionCommandType.Series,
    series,
  };
}

function parseFontShapeCommand(token: CommandToken): SelectionCommandFontShape {
  const shapesToken = testForOneRequiredArgument(token, "shape");
  const shape = parseToFontValue(shapesToken, parseFontShape);
  return {
    type: SelectionCommandType.Shape,
    shape,
  };
}

function parseFontSizeCommand(token: CommandToken): SelectionCommandFontSize {
  if (
    token.arguments.length !== 1 ||
    token.arguments[0].type !== LatexCommandArgumentType.Required ||
    token.arguments[0].content.length !== 2
  ) {
    throw new Error("Font size requires one required argument with two items inside");
  }

  const [fontSizeToken, baselineSkipToken] = token.arguments[0].content;
  const fontSize = parseToFontValue(fontSizeToken, parseFontMeasurement);
  const baselineSkip = parseToFontValue(baselineSkipToken, parseFontMeasurement);

  return {
    type: SelectionCommandType.Size,
    size: fontSize,
    baselineSkip,
  };
}

function parseFontLinespreadCommand(token: CommandToken): SelectionCommandFontLineSpread {
  const linespreadToken = testForOneRequiredArgument(token, "linespread");
  const lineSpread = parseToFontValue(linespreadToken, parseFloat);

  return {
    type: SelectionCommandType.LineSpread,
    value: lineSpread,
  };
}

export function parseSelectionCommandSection(token: CommandToken): SelectionCommand {
  switch (token.name.toLocaleLowerCase()) {
    case "fontencoding":
      return parseFontEncodingCommand(token);
    case "fontfamily":
      return parseFontFamilyCommand(token);
    case "fontseries":
      return parseFontSeriesCommand(token);
    case "fontshape":
      return parseFontShapeCommand(token);
    case "fontsize":
      return parseFontSizeCommand(token);
    case "linespread":
      return parseFontLinespreadCommand(token);
    default:
      throw new Error("Unrecognized command");
  }
}

/** Expects the lexer to be at the backslash before the command name (e.g.. \fontsize) */
export function parseSelectionCommandSections(tokens: LatexToken[]): LatexFont {
  const selectionCommands: SelectionCommand[] = [];
  for (const token of tokens) {
    if (token.type !== LatexTokenType.Command) {
      continue;
    }
    const command = parseSelectionCommandSection(token);
    selectionCommands.push(command);
  }

  return parseSelectionCommands(selectionCommands);
}

/** Expects the lexer to be at the backslash before the command name (e.g.. \usefont) */
export function parseUseFont(token: LatexToken): LatexFont {
  if (
    token.type !== LatexTokenType.Command ||
    token.name !== "usefont" ||
    token.arguments.length !== 4 ||
    !token.arguments.every((a) => a.type === LatexCommandArgumentType.Required)
  ) {
    throw new Error("Command must be a valid usefont command to be parsed as usefont");
  }

  const [encArg, familyArg, seriesArg, shapeArg] = token.arguments;
  for (const arg of [encArg, familyArg, seriesArg, shapeArg]) {
    if (arg.content.length !== 1) {
      throw new Error("Expected usefont arguments to only have one value");
    }
  }

  const encoding = parseToFontValue(encArg.content[0], parseFontEncoding);
  const family = parseToFontValue(familyArg.content[0], parseFontFamily);
  const series = parseToFontValue(seriesArg.content[0], parseFontSeries);
  const shape = parseToFontValue(shapeArg.content[0], parseFontShape);

  return { encoding, family, series, shape };
}
