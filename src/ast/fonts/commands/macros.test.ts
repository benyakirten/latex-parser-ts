import { describe, expect, test } from "bun:test";

import type { LatexFontCurrentValues } from "../types";
import { determineCurrentFontKey } from "./macros";

describe("determineCurrentFontKey", () => {
	test.each([
		["f@encoding", "encoding"],
		["f@family", "family"],
		["f@shape", "shape"],
		["f@size", "size"],
		["f@baselineskip", "baselineSkip"],
		["tf@size", "mathSize"],
		["sf@size", "mathScriptSize"],
		["ssf@size", "mathScriptScriptSize"],
		["unknownCommand", null],
	])("should return %s given %s", (commandName, expected) => {
		const result = determineCurrentFontKey(commandName);
		expect(result).toEqual(expected as keyof LatexFontCurrentValues);
	});
});
