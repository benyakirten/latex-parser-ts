import { describe, expect, it } from "bun:test";

import {
	type Argument,
	CommandArgumentType,
	type CommandToken,
	type ContentToken,
	type PlaceholderToken,
	type SimpleMacro,
	type Token,
	TokenType,
} from "./types";
import {
	getRequiredContent,
	getRequiredContentItem,
	getRequiredSimpleMacro,
	isSimpleMacro,
} from "./utils";

describe("isSimpleMacro", () => {
	it("should return true if the token is a command with no arguments", () => {
		const token: SimpleMacro = {
			type: TokenType.Command,
			literal: "\\macro",
			name: "macro",
			arguments: [],
		};
		expect(isSimpleMacro(token)).toBeTrue();
	});

	it("should return false if the token is not a command", () => {
		const token: PlaceholderToken = {
			type: TokenType.Placeholder,
			literal: "#1",
			content: 1,
		};
		expect(isSimpleMacro(token)).toBeFalse();
	});

	it("should return false if the token has arguments", () => {
		const token: CommandToken = {
			type: TokenType.Command,
			literal: "\\macro",
			name: "macro",
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [],
				},
			],
		};
		expect(isSimpleMacro(token)).toBeFalse();
	});
});

describe("getRequiredContentItem", () => {
	it("should return null if the argument is undefined", () => {
		const got = getRequiredContentItem(undefined);
		expect(got).toBeNull();
	});

	it("should return null if the argument type is not Required", () => {
		const arg: Argument = {
			type: CommandArgumentType.Optional,
			content: [],
		};
		const got = getRequiredContentItem(arg);
		expect(got).toBeNull();
	});

	it("should return null if the argument content length is not 1", () => {
		const arg: Argument = {
			type: CommandArgumentType.Required,
			content: [
				{ type: TokenType.Content, literal: "item1", originalLength: 5 },
				{ type: TokenType.Content, literal: "item2", originalLength: 5 },
			],
		};
		const got = getRequiredContentItem(arg);
		expect(got).toBeNull();
	});

	it("should return the content item if the argument is valid", () => {
		const contentToken: ContentToken = {
			type: TokenType.Content,
			literal: "item1",
			originalLength: 5,
		};
		const arg: Argument = {
			type: CommandArgumentType.Required,
			content: [contentToken],
		};
		const got = getRequiredContentItem(arg);
		expect(got).toBe(contentToken);
	});
});

describe("getRequiredSimpleMacro", () => {
	it("should return null if the argument is undefined", () => {
		const got = getRequiredSimpleMacro(undefined);
		expect(got).toBeNull();
	});

	it("should return null if the argument is not a required content item", () => {
		const arg: Argument = {
			type: CommandArgumentType.Optional,
			content: [],
		};
		const got = getRequiredSimpleMacro(arg);
		expect(got).toBeNull();
	});

	it("should return null if the argument content is not a simple macro", () => {
		let contentToken: Token = {
			type: TokenType.Content,
			literal: "item1",
			originalLength: 5,
		};
		const arg: Argument = {
			type: CommandArgumentType.Required,
			content: [contentToken],
		};
		let got = getRequiredSimpleMacro(arg);
		expect(got).toBeNull();

		contentToken = {
			type: TokenType.Command,
			literal: "\\macro",
			name: "macro",
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [],
				},
			],
		};
		got = getRequiredSimpleMacro(arg);
		expect(got).toBeNull();
	});

	it("should return the simple macro if the argument is valid", () => {
		const token: SimpleMacro = {
			type: TokenType.Command,
			literal: "\\macro",
			name: "macro",
			arguments: [],
		};
		const arg: Argument = {
			type: CommandArgumentType.Required,
			content: [token],
		};
		const got = getRequiredSimpleMacro(arg);
		expect(got).toBe(token);
	});
});
describe("getRequiredContent", () => {
	it("should return null if the argument is undefined", () => {
		const got = getRequiredContent(undefined);
		expect(got).toBeNull();
	});

	it("should return null if the argument type is not Required", () => {
		const arg: Argument = {
			type: CommandArgumentType.Optional,
			content: [],
		};
		const got = getRequiredContent(arg);
		expect(got).toBeNull();
	});

	it("should return null if the argument content is not a content token", () => {
		const arg: Argument = {
			type: CommandArgumentType.Required,
			content: [
				{
					type: TokenType.Command,
					literal: "\\macro",
					name: "macro",
					arguments: [],
				},
			],
		};
		const got = getRequiredContent(arg);
		expect(got).toBeNull();
	});

	it("should return the content literal if the argument is valid", () => {
		const contentToken: Token = {
			type: TokenType.Content,
			literal: "item1",
			originalLength: 5,
		};
		const arg: Argument = {
			type: CommandArgumentType.Required,
			content: [contentToken],
		};
		const got = getRequiredContent(arg);
		expect(got).toBe(contentToken.literal);
	});
});
