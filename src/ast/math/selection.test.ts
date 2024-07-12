import { describe, expect, it } from "bun:test";

import {
	type CommandToken,
	LatexCommandArgumentType,
	LatexTokenType,
} from "../../lexer/types";
import { isMathSelection, isMathVersion } from "./selection";
import { MathFont } from "./types";

describe("isMathSelection", () => {
	it("should return true for valid MathFont names", () => {
		expect(isMathSelection(MathFont.Normal)).toBe(true);
		expect(isMathSelection(MathFont.Serif)).toBe(true);
		expect(isMathSelection(MathFont.BoldRoman)).toBe(true);
		expect(isMathSelection(MathFont.SansSerif)).toBe(true);
		expect(isMathSelection(MathFont.TextItalic)).toBe(true);
		expect(isMathSelection(MathFont.Typewriter)).toBe(true);
		expect(isMathSelection(MathFont.Calligraphic)).toBe(true);
	});

	it("should return false for invalid MathFont names", () => {
		expect(isMathSelection("UnknownFont")).toBe(false);
		expect(isMathSelection("")).toBe(false);
		expect(isMathSelection("123")).toBe(false);
		expect(isMathSelection("mathversion")).toBe(false);
	});
});

describe("isMathVersion", () => {
	it("should return false if the command has more than one argument", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
					],
				},
			],
		};

		const got = isMathVersion(command);
		expect(got).toBeFalse();
	});

	it("should return true if the command has one argument and the command's name is mathversion", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
					],
				},
			],
		};

		const got = isMathVersion(command);
		expect(got).toBeTrue();
	});

	it("should return true if the command's name is a normal or bold followed by math with no arguments", () => {
		let command: CommandToken = {
			name: "normalmath",
			literal: "\\normalmath",
			type: LatexTokenType.Command,
			arguments: [],
		};

		let got = isMathVersion(command);
		expect(got).toBeTrue();

		command = {
			name: "boldmath",
			literal: "\\boldmath",
			type: LatexTokenType.Command,
			arguments: [],
		};

		got = isMathVersion(command);
		expect(got).toBeTrue();
	});

	it("should return true if the command's name is a valid version followed by math with no arguments", () => {
		const command: CommandToken = {
			name: "coolmath",
			literal: "\\coolmath",
			type: LatexTokenType.Command,
			arguments: [],
		};

		const got = isMathVersion(command, ["cool"]);
		expect(got).toBeTrue();
	});

	it("should return false otherwise", () => {
		const command: CommandToken = {
			name: "coolmath",
			literal: "\\coolmath",
			type: LatexTokenType.Command,
			arguments: [],
		};

		const got = isMathVersion(command, []);
		expect(got).toBeFalse();
	});
});
