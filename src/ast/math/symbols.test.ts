import { expect, it, describe, test } from "bun:test";

import { validateMathSymbolType } from "./symbols";
import { MathSymbolType } from "./types";

describe("validateMathSymbolType", () => {
	test.each<[MathSymbolType, number | string]>([
		[MathSymbolType.Ordinary, 0],
		[MathSymbolType.Ordinary, "0"],
		[MathSymbolType.Ordinary, "mathord"],
		[MathSymbolType.LargeOperator, 1],
		[MathSymbolType.LargeOperator, "1"],
		[MathSymbolType.LargeOperator, "mathop"],
		[MathSymbolType.BinaryOperator, 2],
		[MathSymbolType.BinaryOperator, "2"],
		[MathSymbolType.BinaryOperator, "mathbin"],
		[MathSymbolType.Relation, 3],
		[MathSymbolType.Relation, "3"],
		[MathSymbolType.Relation, "mathrel"],
		[MathSymbolType.Open, 4],
		[MathSymbolType.Open, "4"],
		[MathSymbolType.Open, "mathopen"],
		[MathSymbolType.Close, 5],
		[MathSymbolType.Close, "5"],
		[MathSymbolType.Close, "mathclose"],
		[MathSymbolType.Punctuation, 6],
		[MathSymbolType.Punctuation, "6"],
		[MathSymbolType.Punctuation, "mathpunct"],
		[MathSymbolType.AlphabetChar, 7],
		[MathSymbolType.AlphabetChar, "7"],
		[MathSymbolType.AlphabetChar, "mathalpha"],
	])("should return %s for input %s", (want, input) => {
		const got = validateMathSymbolType(input);
		expect(got).toBe(want);
	});

	it("should return null for unknown symbolType", () => {
		const got = validateMathSymbolType("unknown");
		expect(got).toBeNull();
	});
});
