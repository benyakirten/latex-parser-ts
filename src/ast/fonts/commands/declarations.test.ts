import { describe, expect, it } from "bun:test";

import {
	CommandArgumentType,
	type CommandToken,
	TokenType,
} from "../../../lexer/types";
import {
	AuthorCommandType,
	FontEncodingNormalValue,
	FontEncodingType,
	FontShapeValue,
	FontSizeUnit,
	FontValueType,
	FontWeight,
	FontWidth,
} from "../types";
import {
	parseDeclareFixedFont,
	parseDeclareTextFontCommand,
} from "./declarations";

describe("parseDeclareFixedFont", () => {
	it("should throw an error if the command is not named DeclareFixedFont", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareTextFont",
			name: "DeclareTextFont",
			arguments: [],
		};
		expect(() => parseDeclareFixedFont(command)).toThrow();
	});

	it("should throw an error if the command does not have 6 arguments", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareFixedFont",
			name: "DeclareFixedFont",
			arguments: [],
		};
		expect(() => parseDeclareFixedFont(command)).toThrow();
	});

	it("should throw an error if the first argument is not a macro", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareFixedFont",
			name: "DeclareFixedFont",
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "name",
							originalLength: 4,
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
					content: [
						{
							type: TokenType.Content,
							literal: "cmr",
							originalLength: 3,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "m",
							originalLength: 1,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "n",
							originalLength: 1,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "5",
							originalLength: 1,
						},
					],
				},
			],
		};
		expect(() => parseDeclareFixedFont(command)).toThrow();
	});

	it("should create a fixed font if all the parameters are valid values", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareFixedFont",
			name: "DeclareFixedFont",
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\myfont",
							name: "myfont",
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
							originalLength: 3,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "cmr",
							originalLength: 3,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "m",
							originalLength: 1,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "n",
							originalLength: 1,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "5",
							originalLength: 1,
						},
					],
				},
			],
		};

		const got = parseDeclareFixedFont(command);
		expect(got).toEqual({
			encoding: {
				type: FontValueType.FontValue,
				value: {
					encoding: FontEncodingNormalValue.KnuthTexText,
					type: FontEncodingType.Normal,
				},
			},
			family: {
				type: FontValueType.FontValue,
				value: "cmr",
			},
			name: "myfont",
			series: {
				type: FontValueType.FontValue,
				value: {
					weight: FontWeight.Medium,
					width: FontWidth.Medium,
				},
			},
			shape: {
				type: FontValueType.FontValue,
				value: FontShapeValue.Normal,
			},
			size: {
				type: FontValueType.FontValue,
				value: {
					unit: FontSizeUnit.Point,
					value: 5,
				},
			},
		});
	});
});

describe("parseDeclareTextFontCommand", () => {
	it("should throw an error if the command is not named DeclareTextFontCommand", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareFixedFont",
			name: "DeclareFixedFont",
			arguments: [],
		};
		expect(() => parseDeclareTextFontCommand(command)).toThrow();
	});

	it("should throw an error if the command does not have 2 arguments", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareTextFont",
			name: "DeclareTextFont",
			arguments: [],
		};
		expect(() => parseDeclareTextFontCommand(command)).toThrow();
	});

	it("should throw an error if the first argument is not a macro", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareTextFont",
			name: "DeclareTextFont",
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "name",
							originalLength: 4,
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Content,
							literal: "switch1 switch2",
							originalLength: 16,
						},
					],
				},
			],
		};
		expect(() => parseDeclareTextFontCommand(command)).toThrow();
	});

	it("should throw an error if the second argument contains invalid switches", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareTextFont",
			name: "DeclareTextFont",
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\myfont",
							name: "myfont",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\invalidswitch",
							name: "invalidswitch",
							arguments: [],
						},
					],
				},
			],
		};
		expect(() => parseDeclareTextFontCommand(command)).toThrow();
	});

	it("should parse the command correctly if all arguments are valid", () => {
		const command: CommandToken = {
			type: TokenType.Command,
			literal: "\\DeclareTextFont",
			name: "DeclareTextFont",
			arguments: [
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\myswitch",
							name: "myswitch",
							arguments: [],
						},
					],
				},
				{
					type: CommandArgumentType.Required,
					content: [
						{
							type: TokenType.Command,
							literal: "\\normalfont",
							name: "normalfont",
							arguments: [],
						},
						{
							type: TokenType.Command,
							literal: "\\itshape",
							name: "itshape",
							arguments: [],
						},
					],
				},
			],
		};

		const got = parseDeclareTextFontCommand(command);
		expect(got).toEqual({
			name: "myswitch",
			switches: [
				{
					type: AuthorCommandType.AuthorDefault,
					value: "normal",
				},
				{
					type: AuthorCommandType.AuthorDefault,
					value: "italics",
				},
			],
		});
	});
});

describe.todo("parseDeclareOldFont");
