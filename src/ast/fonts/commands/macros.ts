import { LatexCommandArgumentType, LatexTokenType, type CommandToken } from "../../../lexer/types";
import type { LatexFontCurrentValues, LatexFontDefaults } from "../types";
import { parseFontFamily, parseFontSeries, parseFontShape, parseToFontValue } from "../utils";

export function determineCurrentFontKey(commandName: string): keyof LatexFontCurrentValues | null {
  switch (commandName.toLocaleLowerCase()) {
    case "f@encoding":
      return "encoding";
    case "f@family":
      return "family";
    case "f@shape":
      return "shape";
    case "f@size":
      return "size";
    case "f@baselineskip":
      return "baselineSkip";
    case "tf@size":
      return "mathSize";
    case "sf@size":
      return "mathScriptSize";
    case "ssf@size":
      return "mathScriptScriptSize";
    default:
      return null;
  }
}

function determineDefaultFontKey(commandName: string): keyof LatexFontDefaults | null {
  const namePieces = commandName.split("default");
  if (namePieces.length !== 2) {
    return null;
  }

  const name = namePieces[0].toLocaleLowerCase();

  switch (name) {
    case "rm":
      return "serif";
    case "sf":
      return "sans";
    case "tt":
      return "monospace";
    case "family":
      return "family";
    case "series":
      return "series";
    case "shape":
      return "shape";
    case "bf":
      return "boldseries";
    case "md":
      return "mediumseries";
    case "it":
      return "italics";
    case "sl":
      return "oblique";
    case "sc":
      return "smallCaps";
    case "ssc":
      return "spacedSmallCaps";
    default:
      return null;
  }
}

export function setFontDefaults(renewCommand: CommandToken): Partial<LatexFontDefaults> | null {
  if (renewCommand.name !== "renewcommand") {
    throw new Error("Font defaults can only be set with the renewcommand command");
  }
  const fontDefaults: Partial<LatexFontDefaults> = {};
  if (
    renewCommand.arguments.length !== 2 ||
    renewCommand.arguments.every((arg) => arg.type !== LatexCommandArgumentType.Required)
  ) {
    throw new Error("Expected two required commands to follow renewcommand");
  }

  const [command, content] = renewCommand.arguments.map((a) => a.content);
  if (Array.isArray(command) || command.type !== LatexTokenType.Command) {
    throw new Error("First required argument should be a command");
  }

  if (Array.isArray(content)) {
    throw new Error("Second required argument should be a single token");
  }

  const key = determineDefaultFontKey(command.name);
  if (!key) {
    return null;
  }

  switch (key) {
    case "serif":
    case "monospace":
    case "sans":
    case "family":
      fontDefaults[key] = parseToFontValue(content, parseFontFamily);
      break;
    case "boldseries":
    case "mediumseries":
    case "series":
      fontDefaults[key] = parseToFontValue(content, parseFontSeries);
      break;
    case "smallCaps":
    case "spacedSmallCaps":
    case "italics":
    case "oblique":
    case "shape":
    case "swash":
      fontDefaults[key] = parseToFontValue(content, parseFontShape);
      break;
  }

  return fontDefaults;
}
