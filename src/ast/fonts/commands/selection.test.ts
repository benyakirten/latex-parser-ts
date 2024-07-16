import { describe, expect, it, test } from "bun:test";

import { Lexer } from "../../../lexer/lexer";
import {
	type Font,
	FontEncodingNormalValue,
	FontEncodingType,
	FontShapeValue,
	FontSizeUnit,
	FontValueType,
	FontWeight,
	FontWidth,
} from "../types";
import { parseSelectionCommandSections, parseUseFont } from "./selection";

describe("parseSelectionCommandSections", () => {
	test.each<[Font, string]>([
		[
			{
				encoding: {
					type: FontValueType.FontValue,
					value: {
						type: FontEncodingType.Local,
						encoding: "lt1",
					},
				},
				family: { type: FontValueType.FontValue, value: "ptm" },
				size: {
					type: FontValueType.FontValue,
					value: {
						value: 10,
						unit: FontSizeUnit.Inch,
					},
				},
				baselineSkip: {
					type: FontValueType.FontValue,
					value: {
						value: 12,
						unit: FontSizeUnit.Point,
					},
				},
				series: {
					type: FontValueType.FontValue,
					value: {
						weight: FontWeight.SemiLight,
						width: FontWidth.UltraCondensed,
					},
				},
				shape: {
					type: FontValueType.FontValue,
					value: FontShapeValue.Italic,
				},
				lineSpread: { type: FontValueType.FontValue, value: 1.5 },
			},
			"\\fontfamily{ptm}\\fontseries{sluc}\\fontencoding{lt1}\\fontshape{it}\\fontsize{10in}{12}\\linespread{1.5}\\selectfont",
		],
		[
			{
				encoding: {
					type: FontValueType.FontValue,
					value: {
						type: FontEncodingType.Normal,
						encoding: FontEncodingNormalValue.MathItalic,
					},
				},
				size: {
					type: FontValueType.FontValue,
					value: {
						value: 11,
						unit: FontSizeUnit.Point,
					},
				},
				baselineSkip: {
					type: FontValueType.FontValue,
					value: {
						value: 13,
						unit: FontSizeUnit.Ex,
					},
				},
			},
			"\\fontencoding{oml}\\fontsize{11}{13ex}\\selectfont",
		],
	])("should return $o for an input of %s", (want, input) => {
		const tokens = new Lexer(input).readToEnd();
		const got = parseSelectionCommandSections(tokens);
		expect(got).toEqual(want);
	});

	test.each<string>([
		"\\documentstart",
		"\\fontencoding{oml}\\fontsize{13ex}{11}",
		"\\fontencoding{none}\\selectfont",
		"\\fontshape{none}\\selectfont",
		"\\fontfamily{}\\selectfont",
		"\\fontsize{12none}{12}\\selectfont",
		"\\fontsize{none}{12}\\selectfont",
	])("should throw an error for an input of %s", (input) => {
		const tokens = new Lexer(input).readToEnd();
		expect(() => parseSelectionCommandSections(tokens)).toThrow();
	});
});

describe("parseUseFont", () => {
	it("should parse the encoding, family, weight, width and shape of a font", () => {
		const tokens = new Lexer("\\usefont{oml}{ptm}{sluc}{it}").readToEnd();
		expect(tokens).toHaveLength(1);
		const [token] = tokens;
		const got = parseUseFont(token);
		expect(got).toEqual({
			encoding: {
				type: FontValueType.FontValue,
				value: {
					type: FontEncodingType.Normal,
					encoding: FontEncodingNormalValue.MathItalic,
				},
			},
			family: { type: FontValueType.FontValue, value: "ptm" },
			series: {
				type: FontValueType.FontValue,
				value: {
					weight: FontWeight.SemiLight,
					width: FontWidth.UltraCondensed,
				},
			},
			shape: {
				type: FontValueType.FontValue,
				value: FontShapeValue.Italic,
			},
		});
	});

	it("should throw if the command is not recognized", () => {
		const token = new Lexer("\\fontstuff{oml}{ptm}{sluc}{it}").readToEnd()[0];
		expect(() => parseUseFont(token)).toThrow();
	});

	it("should throw if less than four arguments are provided", () => {
		const token = new Lexer("\\usefont{oml}{ptm}{sluc}").readToEnd()[0];
		expect(() => parseUseFont(token)).toThrow();
	});

	it("should throw if any of the arguments cannot be parsed", () => {
		let lexer = new Lexer("\\usefont{oml}{ptm}{sluc}{unknown}");
		expect(() => parseUseFont(lexer.readToEnd()[0])).toThrow();

		lexer = new Lexer("\\usefont{oml}{ptm}{}{it}");
		expect(() => parseUseFont(lexer.readToEnd()[0])).toThrow();

		lexer = new Lexer("\\usefont{oml}{}{sluc}{it}");
		expect(() => parseUseFont(lexer.readToEnd()[0])).toThrow();

		lexer = new Lexer("\\usefont{unknown}{ptm}{sluc}{it}");
		expect(() => parseUseFont(lexer.readToEnd()[0])).toThrow();
	});
});
