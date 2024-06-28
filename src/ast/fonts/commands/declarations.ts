import {
  LatexCommandArgumentType,
  LatexTokenType,
  type CommandToken,
  type RequiredArgument,
} from "../../../lexer/types";
import type {
  AuthorCommand,
  DeclareFixedFontCommand,
  DeclareOldFontCommand,
  DeclareTextFontCommand,
} from "../types";
import {
  parseToFontValue,
  parseFontEncoding,
  parseFontFamily,
  parseFontSeries,
  parseFontShape,
  parseFontMeasurement,
} from "../utils";
import { parseAuthorCommand } from "./author";

export function parseDeclareFixedFont(command: CommandToken): DeclareFixedFontCommand {
  const commandName = command.name;
  if (commandName !== "DeclareFixedFont") {
    throw new Error("Command must be named DeclareFixedFont");
  }

  const args = command.arguments;
  if (
    args.length !== 6 ||
    args.every((arg) => arg.type !== LatexCommandArgumentType.Required) ||
    args.every((arg) => (arg as RequiredArgument).content.length !== 1)
  ) {
    throw new Error("DeclareFixedFont command must have 6 arguments");
  }

  const [nameArg, encArg, familyArg, seriesArg, shapeArg, sizeArg] = args as RequiredArgument[];

  if (nameArg.content.length !== 1 || nameArg.content[0].type !== LatexTokenType.Command) {
    throw new Error("First argument must be macro to add");
  }

  const name = nameArg.content[0].name;

  const encoding = parseToFontValue(encArg.content[0], parseFontEncoding);
  const family = parseToFontValue(familyArg.content[0], parseFontFamily);
  const series = parseToFontValue(seriesArg.content[0], parseFontSeries);
  const shape = parseToFontValue(shapeArg.content[0], parseFontShape);
  const size = parseToFontValue(sizeArg.content[0], parseFontMeasurement);

  return {
    name,
    encoding,
    family,
    series,
    shape,
    size,
  };
}

export function parseDeclareTextFontCommand(command: CommandToken): DeclareTextFontCommand {
  const commandName = command.name;
  if (commandName !== "DeclareTextFont") {
    throw new Error("Command must be named DeclareTextFontCommand");
  }

  const args = command.arguments;
  if (args.length !== 2 || args.every((arg) => arg.type !== LatexCommandArgumentType.Required)) {
    throw new Error("DeclareTextFontCommand command must have 2 arguments");
  }

  const [nameArg, switchArg] = args as RequiredArgument[];

  if (nameArg.content.length !== 1 || nameArg.content[0].type !== LatexTokenType.Command) {
    throw new Error("First argument must be the macro create");
  }

  const name = nameArg.content[0].name;

  const authorCommands: AuthorCommand[] = [];
  for (const token of switchArg.content) {
    if (token.type !== LatexTokenType.Command || token.arguments.length !== 0) {
      throw new Error("Second argument must be a list of switches with no arguments");
    }

    const authorCommand = parseAuthorCommand(token.name);
    if (!authorCommand) {
      throw new Error("Invalid author command");
    }

    authorCommands.push(authorCommand);
  }

  return {
    name,
    switches: authorCommands,
  };
}

// TODO: Finish functionality after we have math switches
export function parseDeclareOldFont(command: CommandToken): DeclareOldFontCommand {
  const commandName = command.name;
  if (commandName !== "DeclareTextFont") {
    throw new Error("Command must be named DeclareTextFontCommand");
  }

  const args = command.arguments;
  if (args.length !== 2 || args.every((arg) => arg.type !== LatexCommandArgumentType.Required)) {
    throw new Error("DeclareTextFontCommand command must have 2 arguments");
  }

  const [nameArg, textSwitches] = args as RequiredArgument[];

  if (nameArg.content.length !== 1 || nameArg.content[0].type !== LatexTokenType.Command) {
    throw new Error("First argument must be the macro create");
  }

  const name = nameArg.content[0].name;

  const authorCommands: AuthorCommand[] = [];
  for (const token of textSwitches.content) {
    if (token.type !== LatexTokenType.Command || token.arguments.length !== 0) {
      throw new Error("Second argument must be a list of switches with no arguments");
    }

    const authorCommand = parseAuthorCommand(token.name);
    if (!authorCommand) {
      throw new Error("Invalid author command");
    }

    authorCommands.push(authorCommand);
  }

  return {
    name,
    textSwitches: authorCommands,
    mathSwitches: [],
  };
}
