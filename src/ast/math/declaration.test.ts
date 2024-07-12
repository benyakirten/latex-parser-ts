import { describe, expect, it } from "bun:test";

import {
	type CommandToken,
	LatexCommandArgumentType,
	LatexTokenType,
} from "../../lexer/types";
import {
	FontValueType,
	LatexFontEncodingNormalValue,
	LatexFontEncodingType,
	LatexFontShapeValue,
} from "../fonts/types";
import {
	declareMathAlphabet,
	setMathAlphabet,
	validateDeclaredMathVersion,
} from "./declaration";
import { MathAlphabetDeclarationType } from "./types";

describe("validateDeclaredMathVersion", () => {
	it("should return the literal value if the command has one required argument with one content token", () => {
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

		const result = validateDeclaredMathVersion(command);
		expect(result).toBe("normal");
	});

	it("should return null if the command has no arguments", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: LatexTokenType.Command,
			arguments: [],
		};

		const result = validateDeclaredMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command has more than one argument", () => {
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
							literal: "bold",
							originalLength: 4,
						},
					],
				},
			],
		};

		const result = validateDeclaredMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command's argument is not of type Required", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Optional,
					content: [],
				},
			],
		};

		const result = validateDeclaredMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command's argument has more than one content token", () => {
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
						{
							type: LatexTokenType.Content,
							literal: "bold",
							originalLength: 4,
						},
					],
				},
			],
		};

		const result = validateDeclaredMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command's argument content token is not of type Content", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Command,
							literal: "\\normal",
							name: "normal",
							arguments: [],
						},
					],
				},
			],
		};

		const result = validateDeclaredMathVersion(command);
		expect(result).toBeNull();
	});
});

describe("declareMathAlphabet", () => {
	it("should return null if the command name is not 'DeclareMathAlphabet'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: LatexTokenType.Command,
			arguments: [],
		};

		const result = declareMathAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if the command has less than 5 arguments", () => {
		const command: CommandToken = {
			name: "DeclareMathAlphabet",
			literal: "\\DeclareMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
			],
		};

		const result = declareMathAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if any argument content has more than one token", () => {
		const command: CommandToken = {
			name: "DeclareMathAlphabet",
			literal: "\\DeclareMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "argument1",
							originalLength: 9,
						},
						{
							type: LatexTokenType.Content,
							literal: "extraToken",
							originalLength: 10,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "argument2",
							originalLength: 9,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "argument3",
							originalLength: 9,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "argument4",
							originalLength: 9,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "argument5",
							originalLength: 9,
						},
					],
				},
			],
		};

		const result = declareMathAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return the MathAlphabetDeclaration object if the command is valid", () => {
		const command: CommandToken = {
			name: "DeclareMathAlphabet",
			literal: "\\DeclareMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Command,
							literal: "\\mathfontname",
							name: "mathfontname",
							arguments: [],
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "OT1",
							originalLength: 38,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Command,
							literal: "\\coolcommand",
							name: "coolcommand",
							arguments: [],
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "it",
							originalLength: 2,
						},
					],
				},
			],
		};

		const result = declareMathAlphabet(command);
		expect(result).toEqual({
			name: "mathfontname",
			encoding: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.FontValue,
					value: {
						type: LatexFontEncodingType.Normal,
						encoding: LatexFontEncodingNormalValue.KnuthTexText,
					},
				},
			},
			family: {
				type: MathAlphabetDeclarationType.Reset,
			},
			series: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.CommandToken,
					value: {
						type: LatexTokenType.Command,
						literal: "\\coolcommand",
						name: "coolcommand",
						arguments: [],
					},
				},
			},
			shape: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.FontValue,
					value: LatexFontShapeValue.Italic,
				},
			},
		});
	});
});

describe("setMathAlphabet", () => {
	it("should return null if the command name is not 'SetMathAlphabet'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: LatexTokenType.Command,
			arguments: [],
		};
		const result = setMathAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if the command has less than 6 arguments", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
			],
		};
		const result = setMathAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if every argument is not of type Required", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Optional,
					content: [],
				},
			],
		};
		const result = setMathAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if the version argument does not contain one content token", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Optional,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "version",
							originalLength: 7,
						},
						{
							type: LatexTokenType.Content,
							literal: "extraToken",
							originalLength: 10,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
			],
		};
		const result = setMathAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if the declaration is invalid", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Command,
							literal: "\\mathfontname",
							name: "mathfontname",
							arguments: [],
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
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Placeholder,
							literal: "#1",
							content: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Command,
							literal: "\\coolcommand",
							name: "coolcommand",
							arguments: [],
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "it",
							originalLength: 2,
						},
					],
				},
			],
		};
		expect(() => setMathAlphabet(command)).toThrow();
	});

	it("should return the SetMathAlphabetDeclaration object if the command is valid", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Command,
							literal: "\\mathfontname",
							name: "mathfontname",
							arguments: [],
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
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "OT1",
							originalLength: 3,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Command,
							literal: "\\coolcommand",
							name: "coolcommand",
							arguments: [],
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "it",
							originalLength: 2,
						},
					],
				},
			],
		};
		const result = setMathAlphabet(command);
		expect(result).toEqual({
			name: "mathfontname",
			version: "normal",
			encoding: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.FontValue,
					value: {
						type: LatexFontEncodingType.Normal,
						encoding: LatexFontEncodingNormalValue.KnuthTexText,
					},
				},
			},
			family: {
				type: MathAlphabetDeclarationType.Reset,
			},
			series: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.CommandToken,
					value: {
						type: LatexTokenType.Command,
						literal: "\\coolcommand",
						name: "coolcommand",
						arguments: [],
					},
				},
			},
			shape: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.FontValue,
					value: LatexFontShapeValue.Italic,
				},
			},
		});
	});
});
