import { describe, expect, it, test } from "bun:test";

import {
	type CommandToken,
	LatexCommandArgumentType,
	type LatexToken,
	LatexTokenType,
} from "../../lexer/types";
import { LatexFontSizeUnit } from "../fonts/types";
import {
	declareMathAccent,
	declareMathDelimiter,
	declareMathRadical,
	declareMathSizes,
	declareMathSymbol,
	getMathSymbolType,
} from "./symbols";
import {
	type MathSize,
	MathSymbolFont,
	MathSymbolType,
	MathSymbolValueType,
} from "./types";

describe("getMathSymbolType", () => {
	test.each<[MathSymbolType, string]>([
		[MathSymbolType.Ordinary, "0"],
		[MathSymbolType.Ordinary, "mathord"],
		[MathSymbolType.LargeOperator, "1"],
		[MathSymbolType.LargeOperator, "mathop"],
		[MathSymbolType.BinaryOperator, "2"],
		[MathSymbolType.BinaryOperator, "mathbin"],
		[MathSymbolType.Relation, "3"],
		[MathSymbolType.Relation, "mathrel"],
		[MathSymbolType.Open, "4"],
		[MathSymbolType.Open, "mathopen"],
		[MathSymbolType.Close, "5"],
		[MathSymbolType.Close, "mathclose"],
		[MathSymbolType.Punctuation, "6"],
		[MathSymbolType.Punctuation, "mathpunct"],
		[MathSymbolType.AlphabetChar, "7"],
		[MathSymbolType.AlphabetChar, "mathalpha"],
	])("should return %s for input %s", (want, input) => {
		let token: LatexToken;
		if (input.length === 1) {
			token = {
				type: LatexTokenType.Content,
				literal: input,
				originalLength: 1,
			};
		} else {
			token = {
				type: LatexTokenType.Command,
				name: input,
				literal: `\\${input}`,
				arguments: [],
			};
		}
		const got = getMathSymbolType(token);
		expect(got).toBe(want);
	});

	it("should return null for an unrecognized command", () => {
		const got = getMathSymbolType({
			type: LatexTokenType.Command,
			name: "unknown",
			literal: "\\unknown",
			arguments: [],
		});
		expect(got).toBeNull();
	});

	it("should return null for a command token that's not a simple macro", () => {
		const got = getMathSymbolType({
			type: LatexTokenType.Command,
			name: "mathrel",
			literal: "\\mathrel",
			arguments: [{ type: LatexCommandArgumentType.Required, content: [] }],
		});
		expect(got).toBeNull();
	});

	it("should return null for a content token with an unrecognized value", () => {
		const got = getMathSymbolType({
			type: LatexTokenType.Content,
			literal: "unknown",
			originalLength: 7,
		});
		expect(got).toBeNull();
	});

	it("should return null for a token that's not content or a command", () => {
		const got = getMathSymbolType({
			type: LatexTokenType.Placeholder,
			literal: "#1",
			content: 1,
		});
		expect(got).toBeNull();
	});
});

describe("declareMathSymbol", () => {
	it("should return null if command name is not 'DeclareMathSymbol'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
		};
		const got = declareMathSymbol(command);
		expect(got).toBeNull();
	});

	it("should return null if number of arguments is not 4", () => {
		const command: CommandToken = {
			name: "DeclareMathSymbol",
			literal: "\\DeclareMathSymbol",
			type: LatexTokenType.Command,
			arguments: [],
		};
		const got = declareMathSymbol(command);
		expect(got).toBeNull();
	});

	it("should return null if any of arguments is not required", () => {
		const command: CommandToken = {
			name: "DeclareMathSymbol",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Optional,
					content: {
						type: LatexTokenType.Content,
						literal: '"00',
						originalLength: 3,
					},
				},
			],
			literal: "\\DeclareMathSymbol",
			type: LatexTokenType.Command,
		};

		const got = declareMathSymbol(command);
		expect(got).toBeNull();
	});

	it("should return null if any argument's content has length !== 1", () => {
		const command: CommandToken = {
			name: "DeclareMathSymbol",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathSymbol",
			type: LatexTokenType.Command,
		};
		const got = declareMathSymbol(command);
		expect(got).toBeNull();
	});

	it("should return null if name token is not a valid math symbol name", () => {
		const command: CommandToken = {
			name: "DeclareMathSymbol",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathSymbol",
			type: LatexTokenType.Command,
		};
		const got = declareMathSymbol(command);
		expect(got).toBeNull();
	});

	it("should return null if type token is not a valid math symbol type", () => {
		const command: CommandToken = {
			name: "DeclareMathSymbol",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "2000",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathSymbol",
			type: LatexTokenType.Command,
		};
		const got = declareMathSymbol(command);
		expect(got).toBeNull();
	});

	it("should return null if symbol font or slot is not valid", () => {
		const command: CommandToken = {
			name: "DeclareMathSymbol",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "invalid",
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathSymbol",
			type: LatexTokenType.Command,
		};
		const got = declareMathSymbol(command);
		expect(got).toBeNull();
	});

	it("should return a valid MathSymbol object if all conditions are met", () => {
		const command: CommandToken = {
			name: "DeclareMathSymbol",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "symbolFont",
							originalLength: 10,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathSymbol",
			type: LatexTokenType.Command,
		};
		const symbolFonts = ["symbolFont"];
		const got = declareMathSymbol(command, symbolFonts);
		expect(got).toEqual({
			symbol: { type: MathSymbolValueType.Char, value: "-" },
			type: MathSymbolType.Ordinary,
			fontSlot: { symbolFont: "symbolFont", slot: '"00' },
		});
	});
});

describe("declareMathAccent", () => {
	it("should return null if command name is not 'DeclareMathAccent'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
		};
		const got = declareMathAccent(command);
		expect(got).toBeNull();
	});

	it("should return null if number of arguments is not 4", () => {
		const command: CommandToken = {
			name: "DeclareMathAccent",
			literal: "\\DeclareMathAccent",
			type: LatexTokenType.Command,
			arguments: [],
		};
		const got = declareMathAccent(command);
		expect(got).toBeNull();
	});

	it("should return null if any of arguments is not required", () => {
		const command: CommandToken = {
			name: "DeclareMathAccent",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Optional,
					content: {
						type: LatexTokenType.Content,
						literal: '"00',
						originalLength: 3,
					},
				},
			],
			literal: "\\DeclareMathAccent",
			type: LatexTokenType.Command,
		};

		const got = declareMathAccent(command);
		expect(got).toBeNull();
	});

	it("should return null if any argument's content has length !== 1", () => {
		const command: CommandToken = {
			name: "DeclareMathAccent",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathAccent",
			type: LatexTokenType.Command,
		};
		const got = declareMathAccent(command);
		expect(got).toBeNull();
	});

	it("should return null if name token is not a valid math symbol name", () => {
		const command: CommandToken = {
			name: "DeclareMathAccent",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathAccent",
			type: LatexTokenType.Command,
		};
		const got = declareMathAccent(command);
		expect(got).toBeNull();
	});

	it("should return null if type token is not a valid math symbol type", () => {
		const command: CommandToken = {
			name: "DeclareMathAccent",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "2000",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathAccent",
			type: LatexTokenType.Command,
		};
		const got = declareMathAccent(command);
		expect(got).toBeNull();
	});

	it("should return null if symbol font or slot is not valid", () => {
		const command: CommandToken = {
			name: "DeclareMathAccent",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "invalid",
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathAccent",
			type: LatexTokenType.Command,
		};
		const got = declareMathAccent(command);
		expect(got).toBeNull();
	});

	it("should return a valid MathSymbol object if all conditions are met", () => {
		const command: CommandToken = {
			name: "DeclareMathAccent",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "symbolFont",
							originalLength: 10,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathAccent",
			type: LatexTokenType.Command,
		};
		const symbolFonts = ["symbolFont"];
		const got = declareMathAccent(command, symbolFonts);
		expect(got).toEqual({
			symbol: { type: MathSymbolValueType.Char, value: "-" },
			type: MathSymbolType.Ordinary,
			fontSlot: { symbolFont: "symbolFont", slot: '"00' },
		});
	});
});

describe("declareMathDelimiter", () => {
	it("should return null if command name is not 'DeclareMathDelimiter'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.LargeSymbols,
							originalLength: MathSymbolFont.LargeSymbols.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"01',
							originalLength: 3,
						},
					],
				},
			],
		};
		const got = declareMathDelimiter(command);
		expect(got).toBeNull();
	});

	it("should return null if number of arguments is not 6", () => {
		const command: CommandToken = {
			name: "DeclareMathDelimiter",
			literal: "\\DeclareMathDelimiter",
			type: LatexTokenType.Command,
			arguments: [],
		};
		const got = declareMathDelimiter(command);
		expect(got).toBeNull();
	});

	it("should return null if any of arguments is not required", () => {
		const command: CommandToken = {
			name: "DeclareMathDelimiter",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Optional,
					content: {
						type: LatexTokenType.Content,
						literal: '"00',
						originalLength: 3,
					},
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.LargeSymbols,
							originalLength: MathSymbolFont.LargeSymbols.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"01',
							originalLength: 3,
						},
					],
				},
			],
			literal: "\\DeclareMathDelimiter",
			type: LatexTokenType.Command,
		};

		const got = declareMathDelimiter(command);
		expect(got).toBeNull();
	});

	it("should return null if any argument's content has length !== 1", () => {
		const command: CommandToken = {
			name: "DeclareMathDelimiter",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.LargeSymbols,
							originalLength: MathSymbolFont.LargeSymbols.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"01',
							originalLength: 3,
						},
					],
				},
			],
			literal: "\\DeclareMathDelimiter",
			type: LatexTokenType.Command,
		};
		const got = declareMathDelimiter(command);
		expect(got).toBeNull();
	});

	it("should return null if name token is not a valid math symbol name", () => {
		const command: CommandToken = {
			name: "DeclareMathDelimiter",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathDelimiter",
			type: LatexTokenType.Command,
		};
		const got = declareMathDelimiter(command);
		expect(got).toBeNull();
	});

	it("should return null if type token is not a valid math symbol type", () => {
		const command: CommandToken = {
			name: "DeclareMathDelimiter",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "2000",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathDelimiter",
			type: LatexTokenType.Command,
		};
		const got = declareMathDelimiter(command);
		expect(got).toBeNull();
	});

	it("should return null if symbol font or slot is not valid", () => {
		const command: CommandToken = {
			name: "DeclareMathDelimiter",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "invalid",
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "invalid",
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
			],
			literal: "\\DeclareMathDelimiter",
			type: LatexTokenType.Command,
		};
		const got = declareMathDelimiter(command);
		expect(got).toBeNull();
	});

	it("should return a valid MathDelimiter object if all conditions are met", () => {
		const command: CommandToken = {
			name: "DeclareMathDelimiter",
			literal: "\\DeclareMathDelimiter",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "0",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: MathSymbolFont.Operators.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.LargeSymbols,
							originalLength: MathSymbolFont.LargeSymbols.length,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"01',
							originalLength: 3,
						},
					],
				},
			],
		};
		const got = declareMathDelimiter(command);
		expect(got).toEqual({
			symbol: { type: MathSymbolValueType.Char, value: "-" },
			type: MathSymbolType.Ordinary,
			fontSlot1: { symbolFont: MathSymbolFont.Operators, slot: '"00' },
			fontSlot2: { symbolFont: MathSymbolFont.LargeSymbols, slot: '"01' },
		});
	});
});

describe("declareMathRadical", () => {
	it("should return null if command name is not 'DeclareMathRadical'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"01',
							originalLength: 7,
						},
					],
				},
			],
		};
		const got = declareMathRadical(command);
		expect(got).toBeNull();
	});

	it("should return null if number of arguments is not 5", () => {
		const command: CommandToken = {
			name: "DeclareMathRadical",
			literal: "\\DeclareMathRadical",
			type: LatexTokenType.Command,
			arguments: [],
		};
		const got = declareMathRadical(command);
		expect(got).toBeNull();
	});

	it("should return null if any of arguments is not required", () => {
		const command: CommandToken = {
			name: "DeclareMathRadical",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Optional,
					content: {
						type: LatexTokenType.Content,
						literal: '"01',
						originalLength: 7,
					},
				},
			],
			literal: "\\DeclareMathRadical",
			type: LatexTokenType.Command,
		};

		const got = declareMathRadical(command);
		expect(got).toBeNull();
	});

	it("should return null if any argument's content has length !== 1", () => {
		const command: CommandToken = {
			name: "DeclareMathRadical",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"01',
							originalLength: 7,
						},
					],
				},
			],
			literal: "\\DeclareMathRadical",
			type: LatexTokenType.Command,
		};
		const got = declareMathRadical(command);
		expect(got).toBeNull();
	});

	it("should return a valid MathRadical object if all conditions are met", () => {
		const command: CommandToken = {
			name: "DeclareMathRadical",
			literal: "\\DeclareMathRadical",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "-",
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.Operators,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"00',
							originalLength: 7,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: MathSymbolFont.LargeSymbols,
							originalLength: 1,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: '"01',
							originalLength: 7,
						},
					],
				},
			],
		};
		const got = declareMathRadical(command);
		expect(got).toEqual({
			symbol: { type: MathSymbolValueType.Char, value: "-" },
			fontSlot1: { symbolFont: MathSymbolFont.Operators, slot: '"00' },
			fontSlot2: { symbolFont: MathSymbolFont.LargeSymbols, slot: '"01' },
		});
	});
});

describe("declareMathSizes", () => {
	it("should return null if command name is not 'DeclareMathSizes'", () => {
		const command: CommandToken = {
			name: "InvalidCommand",
			literal: "\\InvalidCommand",
			type: LatexTokenType.Command,
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "10pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "12pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "14pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "16pt",
							originalLength: 4,
						},
					],
				},
			],
		};
		const got = declareMathSizes(command);
		expect(got).toBeNull();
	});

	it("should return null if number of arguments is not 4", () => {
		const command: CommandToken = {
			name: "DeclareMathSizes",
			literal: "\\DeclareMathSizes",
			type: LatexTokenType.Command,
			arguments: [],
		};
		const got = declareMathSizes(command);
		expect(got).toBeNull();
	});

	it("should return null if any of arguments is not required", () => {
		const command: CommandToken = {
			name: "DeclareMathSizes",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "10pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "12pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "14pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Optional,
					content: {
						type: LatexTokenType.Content,
						literal: "16pt",
						originalLength: 4,
					},
				},
			],
			literal: "\\DeclareMathSizes",
			type: LatexTokenType.Command,
		};

		const got = declareMathSizes(command);
		expect(got).toBeNull();
	});

	it("should return null if any argument's content has length !== 1", () => {
		const command: CommandToken = {
			name: "DeclareMathSizes",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "10pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "12pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "14pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "16pt",
							originalLength: 4,
						},
						{
							type: LatexTokenType.Content,
							literal: "18pt",
							originalLength: 4,
						},
					],
				},
			],
			literal: "\\DeclareMathSizes",
			type: LatexTokenType.Command,
		};
		const got = declareMathSizes(command);
		expect(got).toBeNull();
	});

	it("should return a valid MathSize object if all conditions are met", () => {
		const command: CommandToken = {
			name: "DeclareMathSizes",
			arguments: [
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "10pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "12pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "14pt",
							originalLength: 4,
						},
					],
				},
				{
					type: LatexCommandArgumentType.Required,
					content: [
						{
							type: LatexTokenType.Content,
							literal: "16pt",
							originalLength: 4,
						},
					],
				},
			],
			literal: "\\DeclareMathSizes",
			type: LatexTokenType.Command,
		};
		const got = declareMathSizes(command);
		const expected: MathSize = {
			mathTextSize: { value: 12, unit: LatexFontSizeUnit.Point },
			currentTextSize: { value: 10, unit: LatexFontSizeUnit.Point },
			scriptSize: { value: 14, unit: LatexFontSizeUnit.Point },
			scriptScriptSize: { value: 16, unit: LatexFontSizeUnit.Point },
		};
		expect(got).toEqual(expected);
	});
});
