import { describe, it, expect } from "bun:test";

import { validateDeclaredMathVersion } from "./declaration";
import {
	type CommandToken,
	LatexCommandArgumentType,
	LatexTokenType,
} from "../../lexer/types";

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
