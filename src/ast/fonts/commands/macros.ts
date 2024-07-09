import type { LatexFontCurrentValues } from "../types";

export function determineCurrentFontKey(
  commandName: string,
): keyof LatexFontCurrentValues | null {
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
