import { describe, expect, it, test } from "bun:test";

import {
	CommandArgumentType,
	type CommandToken,
	TokenType,
} from "../../lexer/types";
import {
	FontEncodingNormalValue,
	FontEncodingType,
	FontShapeValue,
	FontValueType,
} from "../fonts/types";
import {
	declareMathOrSymbolAlphabet,
	declareMathVersion,
	declareSymbolFontAlphabet,
	setMathOrSymbolFont,
} from "./declaration";
import {
	MathAlphabetDeclarationType,
	MathFont,
	MathSymbolFont,
	type SymbolFontAlphabet,
} from "./types";

describe("declareMathVersion", () => {
	it("should return the literal value if the command has one required argument with one content token", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
					],
				},
			],
		};

		const result = declareMathVersion(command);
		expect(result).toBe("normal");
	});

	it("should return null if the command has no arguments", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: TokenType.Command,
			arguments: [],
		};

		const result = declareMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command has more than one argument", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "bold",
							originalLength: 4,
						},
					],
				},
			],
		};

		const result = declareMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command's argument is not of type Required", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Optional,
					content: [],
				},
			],
		};

		const result = declareMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command's argument has more than one content token", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
						{
							type: TokenType.Content,
							literal: "bold",
							originalLength: 4,
						},
					],
				},
			],
		};

		const result = declareMathVersion(command);
		expect(result).toBeNull();
	});

	it("should return null if the command's argument content token is not of type Content", () => {
		const command: CommandToken = {
			name: "mathversion",
			literal: "\\mathversion",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\normal",
							name: "normal",
							arguments: [],
						},
					],
				},
			],
		};

		const result = declareMathVersion(command);
		expect(result).toBeNull();
	});
});

describe("declareMathOrSymbolAlphabet", () => {
	it("should return null if the command name is not 'DeclareMathAlphabet' or 'DeclareSymbolFont", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: TokenType.Command,
			arguments: [],
		};

		const result = declareMathOrSymbolAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if the command has less than 5 arguments", () => {
		const command: CommandToken = {
			name: "DeclareMathAlphabet",
			literal: "\\DeclareMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
			],
		};

		const result = declareMathOrSymbolAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if any argument content has more than one token", () => {
		const command: CommandToken = {
			name: "DeclareMathAlphabet",
			literal: "\\DeclareMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "argument1",
							originalLength: 9,
						},
						{
							type: TokenType.Content,
							literal: "extraToken",
							originalLength: 10,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "argument2",
							originalLength: 9,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "argument3",
							originalLength: 9,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "argument4",
							originalLength: 9,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "argument5",
							originalLength: 9,
						},
					],
				},
			],
		};

		const result = declareMathOrSymbolAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return the MathAlphabetDeclaration object if the command is valid", () => {
		const command: CommandToken = {
			name: "DeclareMathAlphabet",
			literal: "\\DeclareMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\mathfontname",
							name: "mathfontname",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "OT1",
							originalLength: 38,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\coolcommand",
							name: "coolcommand",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "it",
							originalLength: 2,
						},
					],
				},
			],
		};

		const result = declareMathOrSymbolAlphabet(command);
		expect(result).toEqual({
			name: "mathfontname",
			encoding: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.FontValue,
					value: {
						type: FontEncodingType.Normal,
						encoding: FontEncodingNormalValue.KnuthTexText,
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
						type: TokenType.Command,
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
					value: FontShapeValue.Italic,
				},
			},
		});
	});
});

describe("setMathOrSymbolFont", () => {
	it("should return null if the command name is not 'SetMathAlphabet' or 'SetSymbolFont'	", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: TokenType.Command,
			arguments: [],
		};
		const result = setMathOrSymbolFont(command);
		expect(result).toBeNull();
	});

	it("should return null if the command has less than 6 arguments", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
			],
		};
		const result = setMathOrSymbolFont(command);
		expect(result).toBeNull();
	});

	it("should return null if every argument is not of type Required", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Optional,
					content: [],
				},
			],
		};
		const result = setMathOrSymbolFont(command);
		expect(result).toBeNull();
	});

	it("should return null if the version argument does not contain one content token", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Optional,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "version",
							originalLength: 7,
						},
						{
							type: TokenType.Content,
							literal: "extraToken",
							originalLength: 10,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
			],
		};
		const result = setMathOrSymbolFont(command);
		expect(result).toBeNull();
	});

	it("should return null if the declaration is invalid", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\mathfontname",
							name: "mathfontname",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Placeholder,
							literal: "#1",
							content: 1,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\coolcommand",
							name: "coolcommand",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "it",
							originalLength: 2,
						},
					],
				},
			],
		};
		expect(() => setMathOrSymbolFont(command)).toThrow();
	});

	it("should return the SetMathAlphabetDeclaration object if the command is valid", () => {
		const command: CommandToken = {
			name: "SetMathAlphabet",
			literal: "\\SetMathAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\mathfontname",
							name: "mathfontname",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "normal",
							originalLength: 6,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "OT1",
							originalLength: 3,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\coolcommand",
							name: "coolcommand",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "it",
							originalLength: 2,
						},
					],
				},
			],
		};
		const result = setMathOrSymbolFont(command);
		expect(result).toEqual({
			name: "mathfontname",
			version: "normal",
			encoding: {
				type: MathAlphabetDeclarationType.Set,
				value: {
					type: FontValueType.FontValue,
					value: {
						type: FontEncodingType.Normal,
						encoding: FontEncodingNormalValue.KnuthTexText,
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
						type: TokenType.Command,
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
					value: FontShapeValue.Italic,
				},
			},
		});
	});
});
describe("declareSymbolFontAlphabet", () => {
	it("should return null if the command name is not 'DeclareSymbolFontAlphabet'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: TokenType.Command,
			arguments: [],
		};

		const result = declareSymbolFontAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if the command has less than 2 arguments", () => {
		const command: CommandToken = {
			name: "DeclareSymbolFontAlphabet",
			literal: "\\DeclareSymbolFontAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [],
				},
			],
		};

		const result = declareSymbolFontAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if any argument content has more than one token", () => {
		const command: CommandToken = {
			name: "DeclareSymbolFontAlphabet",
			literal: "\\DeclareSymbolFontAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "argument1",
							originalLength: 9,
						},
						{
							type: TokenType.Content,
							literal: "extraToken",
							originalLength: 10,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "argument2",
							originalLength: 9,
						},
					],
				},
			],
		};

		const result = declareSymbolFontAlphabet(command);
		expect(result).toBeNull();
	});

	it("should return null if the math alphabet is not valid", () => {
		const command: CommandToken = {
			name: "DeclareSymbolFontAlphabet",
			literal: "\\DeclareSymbolFontAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\invalidalphabet",
							name: "invalidalphabet",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "fontname",
							originalLength: 8,
						},
					],
				},
			],
		};

		const result = declareSymbolFontAlphabet(command, ["validalphabet"]);
		expect(result).toBeNull();
	});

	it("should return null if the symbol font is not valid", () => {
		const command: CommandToken = {
			name: "DeclareSymbolFontAlphabet",
			literal: "\\DeclareSymbolFontAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\validalphabet",
							name: "validalphabet",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "invalidfont",
							originalLength: 10,
						},
					],
				},
			],
		};

		const result = declareSymbolFontAlphabet(
			command,
			["validalphabet"],
			["validfont"],
		);
		expect(result).toBeNull();
	});

	it("should return the SymbolFontAlphabet object if the command is valid", () => {
		const command: CommandToken = {
			name: "DeclareSymbolFontAlphabet",
			literal: "\\DeclareSymbolFontAlphabet",
			type: TokenType.Command,
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\validalphabet",
							name: "validalphabet",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "validfont",
							originalLength: 9,
						},
					],
				},
			],
		};

		const result = declareSymbolFontAlphabet(
			command,
			["validalphabet"],
			["validfont"],
		);
		expect(result).toEqual({
			mathAlphabet: "validalphabet",
			symbolFont: "validfont",
		});
	});

	test.each<[SymbolFontAlphabet, MathFont, MathSymbolFont]>([
		[
			{
				mathAlphabet: MathFont.Normal,
				symbolFont: MathSymbolFont.Operators,
			},
			MathFont.Normal,
			MathSymbolFont.Operators,
		],
		[
			{
				mathAlphabet: MathFont.BoldRoman,
				symbolFont: MathSymbolFont.Letters,
			},
			MathFont.BoldRoman,
			MathSymbolFont.Letters,
		],
		[
			{
				mathAlphabet: MathFont.Calligraphic,
				symbolFont: MathSymbolFont.Symbols,
			},
			MathFont.Calligraphic,
			MathSymbolFont.Symbols,
		],
		[
			{
				mathAlphabet: MathFont.SansSerif,
				symbolFont: MathSymbolFont.LargeSymbols,
			},
			MathFont.SansSerif,
			MathSymbolFont.LargeSymbols,
		],
		[
			{
				mathAlphabet: MathFont.Serif,
				symbolFont: MathSymbolFont.Operators,
			},
			MathFont.Serif,
			MathSymbolFont.Operators,
		],
		[
			{
				mathAlphabet: MathFont.TextItalic,
				symbolFont: MathSymbolFont.Operators,
			},
			MathFont.TextItalic,
			MathSymbolFont.Operators,
		],

		[
			{
				mathAlphabet: MathFont.Typewriter,
				symbolFont: MathSymbolFont.Operators,
			},
			MathFont.Typewriter,
			MathSymbolFont.Operators,
		],
	])(
		"should return %o given a math alphabet of %s and a symbol font of %s",
		(want, mathAlphabet, symbolFont) => {
			const command: CommandToken = {
				name: "DeclareSymbolFontAlphabet",
				literal: "\\DeclareSymbolFontAlphabet",
				type: TokenType.Command,
				arguments: [
					{
						type: CommandArgumentType.Required,
						content: [
							{
								type: TokenType.Command,
								literal: `\\${mathAlphabet}`,
								name: mathAlphabet,
								arguments: [],
							},
						],
					},
					{
						type: CommandArgumentType.Required,
						content: [
							{
								type: TokenType.Content,
								literal: symbolFont,
								originalLength: symbolFont.length,
							},
						],
					},
				],
			};
			const got = declareSymbolFontAlphabet(command);
			expect(got).toEqual(want);
		},
	);
});
