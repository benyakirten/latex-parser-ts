import { beforeEach, describe, expect, it, test } from "bun:test";

import { LatexLexer } from "./lexer";
import {
	type AccentToken,
	type BlockToken,
	type CommandToken,
	type CommentToken,
	type ContentToken,
	type LabeledArgContent,
	LatexAccentType,
	LatexCommandArgumentType,
	type LatexToken,
	LatexTokenType,
	MathPosition,
	type MathToken,
	type OptionalArgument,
	type PlaceholderToken,
	type RequiredArgument,
	type ScriptToken,
	ScriptTokenType,
} from "./types";

const SHORT_LATEX_DOC = "\\documentclass[12pt]{article}";

describe("LatexLexer", () => {
	let lexer: LatexLexer;
	beforeEach(() => {
		lexer = new LatexLexer(SHORT_LATEX_DOC);
	});

	describe("command tokens", () => {
		it("should lex a command with no arguments", () => {
			const got = new LatexLexer("\\command").readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			expect(token).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command",
				arguments: [],
				name: "command",
			});
		});

		it("should be able to lex a command with a simple required argument", () => {
			const got = new LatexLexer("\\command{arg}").readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			const contentArg: ContentToken = {
				type: LatexTokenType.Content,
				literal: "arg",
				originalLength: 3,
			};
			const wantArg: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [contentArg],
			};

			expect(token).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command{arg}",
				arguments: [wantArg],
				name: "command",
			});
		});

		it("should be able to lex a command with a required argument that's a nested command", () => {
			const got = new LatexLexer("\\command{\\command2}").readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			const commandArg: CommandToken = {
				type: LatexTokenType.Command,
				literal: "\\command2",
				arguments: [],
				name: "command2",
			};
			const wantArg: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [commandArg],
			};

			expect(token).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command{\\command2}",
				arguments: [wantArg],
				name: "command",
			});
		});

		it("should be able to lex a command with a required argument with nested arguments", () => {
			const got = new LatexLexer(
				"\\command{\\command2{arg1}{\\command3}}",
			).readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;

			const nestedArg1: ContentToken = {
				type: LatexTokenType.Content,
				literal: "arg1",
				originalLength: 4,
			};
			const nestedRequiredArg1: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [nestedArg1],
			};

			const nestedArg2: CommandToken = {
				type: LatexTokenType.Command,
				literal: "\\command3",
				arguments: [],
				name: "command3",
			};
			const nestedRequiredArg2: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [nestedArg2],
			};

			const topCommandArg: CommandToken = {
				type: LatexTokenType.Command,
				literal: "\\command2{arg1}{\\command3}",
				arguments: [nestedRequiredArg1, nestedRequiredArg2],
				name: "command2",
			};

			const wantArg: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [topCommandArg],
			};

			expect(token).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command{\\command2{arg1}{\\command3}}",
				arguments: [wantArg],
				name: "command",
			});
		});

		it("should be able to lex a command with a simple optional argument", () => {
			const got = new LatexLexer("\\command[arg]").readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			const contentArg: ContentToken = {
				type: LatexTokenType.Content,
				literal: "arg",
				originalLength: 3,
			};
			const optionalArg: OptionalArgument = {
				type: LatexCommandArgumentType.Optional,
				content: contentArg,
			};

			expect(token).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command[arg]",
				arguments: [optionalArg],
				name: "command",
			});
		});

		it("should be lex an optional argument with commas as one content token", () => {
			const got = new LatexLexer("\\command[a,b,c]").readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			const contentArg: ContentToken = {
				type: LatexTokenType.Content,
				literal: "a,b,c",
				originalLength: 5,
			};
			const optionalArg: OptionalArgument = {
				type: LatexCommandArgumentType.Optional,
				content: contentArg,
			};

			expect(token).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command[a,b,c]",
				arguments: [optionalArg],
				name: "command",
			});
		});

		it("should be able to lex commands with multiple labeled optional arguments", () => {
			const got = new LatexLexer(
				"\\command[a=b,c=d,e=\\command2,f=g,h=\\command3,i=j]",
			).readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			const labeledArg1: LabeledArgContent = {
				key: "a",
				value: [
					{
						type: LatexTokenType.Content,
						literal: "b",
						originalLength: 1,
					},
				],
			};

			const labeledArg2: LabeledArgContent = {
				key: "c",
				value: [
					{
						type: LatexTokenType.Content,
						literal: "d",
						originalLength: 1,
					},
				],
			};

			const labeledArg3: LabeledArgContent = {
				key: "e",
				value: [
					{
						type: LatexTokenType.Command,
						literal: "\\command2",
						arguments: [],
						name: "command2",
					},
				],
			};

			const labeledArg4: LabeledArgContent = {
				key: "f",
				value: [
					{
						type: LatexTokenType.Content,
						literal: "g",
						originalLength: 1,
					},
				],
			};

			const labeledArg5: LabeledArgContent = {
				key: "h",
				value: [
					{
						type: LatexTokenType.Command,
						literal: "\\command3",
						arguments: [],
						name: "command3",
					},
				],
			};

			const labeledArg6: LabeledArgContent = {
				key: "i",
				value: [
					{
						type: LatexTokenType.Content,
						literal: "j",
						originalLength: 1,
					},
				],
			};

			const optionalArgs: LabeledArgContent[] = [
				labeledArg1,
				labeledArg2,
				labeledArg3,
				labeledArg4,
				labeledArg5,
				labeledArg6,
			];

			const optionalArg: OptionalArgument = {
				type: LatexCommandArgumentType.Optional,
				content: optionalArgs,
			};

			expect(token).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command[a=b,c=d,e=\\command2,f=g,h=\\command3,i=j]",
				arguments: [optionalArg],
				name: "command",
			});
		});

		it("should be able to lex a new macro command that's written over multiple lines", () => {
			const command =
				"\\newcommand{\\mycommand}[2]{%\n  First argument: #1 \\\\\n  Second argument: #2}";
			const got = new LatexLexer(command).readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			const firstArg: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [
					{
						type: LatexTokenType.Command,
						literal: "\\mycommand",
						arguments: [],
						name: "mycommand",
					},
				],
			};

			const contentToken: ContentToken = {
				type: LatexTokenType.Content,
				literal: "2",
				originalLength: 1,
			};
			const secondArg: OptionalArgument = {
				type: LatexCommandArgumentType.Optional,
				content: contentToken,
			};

			const commentToken: CommentToken = {
				type: LatexTokenType.Comment,
				literal: "%\n",
				content: "",
			};
			const firstContentToken: ContentToken = {
				type: LatexTokenType.Content,
				literal: "  First argument: ",
				originalLength: 18,
			};
			const firstPlaceholderToken: PlaceholderToken = {
				type: LatexTokenType.Placeholder,
				literal: "#1",
				content: 1,
			};
			const secondContentToken: ContentToken = {
				type: LatexTokenType.Content,
				literal: " \\\n  Second argument: ",
				originalLength: 36,
			};
			const secondPlaceholderToken: PlaceholderToken = {
				type: LatexTokenType.Placeholder,
				literal: "#2",
				content: 2,
			};
			const thirdArg: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [
					commentToken,
					firstContentToken,
					firstPlaceholderToken,
					secondContentToken,
					secondPlaceholderToken,
				],
			};

			const want: CommandToken = {
				type: LatexTokenType.Command,
				literal:
					"\\newcommand{\\mycommand}[2]{%\n  First argument: #1 @@<!BACKSLASH!>\n  Second argument: #2}",
				arguments: [firstArg, secondArg, thirdArg],
				name: "newcommand",
			};

			expect(token).toEqual(want);
		});

		it("should be able to lex a command of arbitrary complexity", () => {
			const command =
				"\\newcommand{\\mycommand}[\\mycommand2[2]{\\command3[a=b,c=\\command4{%\nCool Th_in^g: #1}[d=^7,e=^f_f,g=h],i=j]}]";
			const got = new LatexLexer(command).readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;

			const arg1: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [
					{
						type: LatexTokenType.Command,
						literal: "\\mycommand",
						name: "mycommand",
						arguments: [],
					},
				],
			};

			const nestedComment4RequiredArgTokens: LatexToken[] = [
				{
					type: LatexTokenType.Comment,
					literal: "%\n",
					content: "",
				},
				{
					type: LatexTokenType.Content,
					literal: "Cool Th",
					originalLength: 7,
				},
				{
					type: LatexTokenType.Script,
					literal: "_i",
					detail: ScriptTokenType.Sub,
					content: {
						type: LatexTokenType.Content,
						literal: "i",
						originalLength: 1,
					},
				},
				{
					type: LatexTokenType.Content,
					literal: "n",
					originalLength: 1,
				},
				{
					type: LatexTokenType.Script,
					detail: ScriptTokenType.Super,
					literal: "^g",
					content: {
						type: LatexTokenType.Content,
						literal: "g",
						originalLength: 1,
					},
				},
				{
					type: LatexTokenType.Content,
					literal: ": ",
					originalLength: 2,
				},
				{
					type: LatexTokenType.Placeholder,
					literal: "#1",
					content: 1,
				},
			];

			const nestedComment4OptionalArgTokens: LabeledArgContent[] = [
				{
					key: "d",
					value: [
						{
							type: LatexTokenType.Script,
							literal: "^7",
							detail: ScriptTokenType.Super,
							content: {
								type: LatexTokenType.Content,
								literal: "7",
								originalLength: 1,
							},
						},
					],
				},
				{
					key: "e",
					value: [
						{
							type: LatexTokenType.Script,
							literal: "^f",
							detail: ScriptTokenType.Super,
							content: {
								type: LatexTokenType.Content,
								literal: "f",
								originalLength: 1,
							},
						},
						{
							type: LatexTokenType.Script,
							literal: "_f",
							detail: ScriptTokenType.Sub,
							content: {
								literal: "f",
								originalLength: 1,
								type: LatexTokenType.Content,
							},
						},
					],
				},
				{
					key: "g",
					value: [
						{ type: LatexTokenType.Content, literal: "h", originalLength: 1 },
					],
				},
			];

			const nestedCommand4: CommandToken = {
				type: LatexTokenType.Command,
				literal: "\\command4{%\nCool Th_in^g: #1}[d=^7,e=^f_f,g=h]",
				name: "command4",
				arguments: [
					{
						type: LatexCommandArgumentType.Required,
						content: nestedComment4RequiredArgTokens,
					},
					{
						type: LatexCommandArgumentType.Optional,
						content: nestedComment4OptionalArgTokens,
					},
				],
			};

			const arg2OptionalArg: OptionalArgument = {
				type: LatexCommandArgumentType.Optional,
				content: {
					type: LatexTokenType.Content,
					literal: "2",
					originalLength: 1,
				},
			};

			const arg2RequiredArgOptionalArgument: OptionalArgument = {
				type: LatexCommandArgumentType.Optional,
				content: [
					{
						key: "a",
						value: [
							{
								type: LatexTokenType.Content,
								literal: "b",
								originalLength: 1,
							},
						],
					},
					{
						key: "c",
						value: [nestedCommand4],
					},
					{
						key: "i",
						value: [
							{
								type: LatexTokenType.Content,
								literal: "j",
								originalLength: 1,
							},
						],
					},
				],
			};

			const arg2RequiredArgOptionalArgumentCommand: CommandToken = {
				type: LatexTokenType.Command,
				literal:
					"\\command3[a=b,c=\\command4{%\nCool Th_in^g: #1}[d=^7,e=^f_f,g=h],i=j]",
				name: "command3",
				arguments: [arg2RequiredArgOptionalArgument],
			};

			const arg2RequiredArg: RequiredArgument = {
				type: LatexCommandArgumentType.Required,
				content: [arg2RequiredArgOptionalArgumentCommand],
			};

			const arg2: OptionalArgument = {
				type: LatexCommandArgumentType.Optional,
				content: {
					type: LatexTokenType.Command,
					literal:
						"\\mycommand2[2]{\\command3[a=b,c=\\command4{%\nCool Th_in^g: #1}[d=^7,e=^f_f,g=h],i=j]}",
					arguments: [arg2OptionalArg, arg2RequiredArg],
					name: "mycommand2",
				},
			};

			const want: CommandToken = {
				type: LatexTokenType.Command,
				literal:
					"\\newcommand{\\mycommand}[\\mycommand2[2]{\\command3[a=b,c=\\command4{%\nCool Th_in^g: #1}[d=^7,e=^f_f,g=h],i=j]}]",
				name: "newcommand",
				arguments: [arg1, arg2],
			};

			expect(token).toEqual(want);
		});

		it("should correctly parse a command that isn't at the end of a block", () => {
			let got = new LatexLexer("\\command hello").readToEnd();
			expect(got).toHaveLength(2);

			let [command, content] = got as [CommandToken, ContentToken];
			expect(command).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command",
				name: "command",
				arguments: [],
			});
			expect(content).toEqual({
				type: LatexTokenType.Content,
				literal: " hello",
				originalLength: 6,
			});

			got = new LatexLexer("hello \\command").readToEnd();
			expect(got).toHaveLength(2);

			[content, command] = got as [ContentToken, CommandToken];
			expect(command).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command",
				name: "command",
				arguments: [],
			});
			expect(content).toEqual({
				type: LatexTokenType.Content,
				literal: "hello ",
				originalLength: 6,
			});

			got = new LatexLexer("hello \\command bye").readToEnd();
			expect(got).toHaveLength(3);

			const [content1, command1, content2] = got as [
				ContentToken,
				CommandToken,
				ContentToken,
			];
			expect(content1).toEqual({
				type: LatexTokenType.Content,
				literal: "hello ",
				originalLength: 6,
			});
			expect(command1).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command",
				name: "command",
				arguments: [],
			});
			expect(content2).toEqual({
				type: LatexTokenType.Content,
				literal: " bye",
				originalLength: 4,
			});
		});

		// TODO: Add more throwing test casers
		test.each([
			"\\newcommand[\\mycommand2=3]",
			"\\newcommand{\\mycommand2",
			"\\newcommand[\\mycommand2",
		])("should throw an error for an input of %s", (input) => {
			expect(() => new LatexLexer(input).readToEnd()).toThrow();
		});
	});

	describe("placeholder tokens", () => {
		it("should decode # followed by a number as a placeholder", () => {
			const got = new LatexLexer("#1").readToEnd();
			expect(got).toHaveLength(1);
			expect(got).toEqual([
				{
					type: LatexTokenType.Placeholder,
					literal: "#1",
					content: 1,
				},
			]);
		});

		it("should throw if something other than a number follows the #", () => {
			expect(() => new LatexLexer("##").readToEnd()).toThrow();
		});
	});

	it("should throw on lexing an unescaped closing brace and bracket", () => {
		expect(() => new LatexLexer("{\\command3}}").readToEnd()).toThrow();
		expect(() => new LatexLexer("]").readToEnd()).toThrow();
	});

	describe("block", () => {
		it("should build a block on an open brace encapsulating all content until the close brace", () => {
			const got = new LatexLexer(
				"{\\mycommand this is my block {this is a subblock}}",
			).readToEnd();
			expect(got).toHaveLength(1);

			const [token] = got;
			expect(token.type).toEqual(LatexTokenType.Block);

			const { content } = token as BlockToken;
			expect(content).toHaveLength(3);
			expect(content).toEqual([
				{
					type: LatexTokenType.Command,
					name: "mycommand",
					literal: "\\mycommand",
					arguments: [],
				},
				{
					type: LatexTokenType.Content,
					literal: " this is my block ",
					originalLength: 18,
				},
				{
					type: LatexTokenType.Block,
					literal: "{this is a subblock}",
					content: [
						{
							type: LatexTokenType.Content,
							literal: "this is a subblock",
							originalLength: 18,
						},
					],
				},
			]);
		});

		it("should throw if the block is never closed", () => {
			expect(() =>
				new LatexLexer("{\\mycommand this is my block").readToEnd(),
			).toThrow();
		});
	});

	describe("superscripts, subscripts and accents", () => {
		const tokenTypes = [
			{
				start: "\\~",
				wantType: LatexTokenType.Accent as LatexTokenType.Accent,
				wantDetail: LatexAccentType.Tilde,
			},
			{
				start: "\\^",
				wantType: LatexTokenType.Accent as LatexTokenType.Accent,
				wantDetail: LatexAccentType.Circumflex,
			},
			{
				start: "^",
				wantType: LatexTokenType.Script as LatexTokenType.Script,
				wantDetail: ScriptTokenType.Super,
			},
			{
				start: "_",
				wantType: LatexTokenType.Script as LatexTokenType.Script,
				wantDetail: ScriptTokenType.Sub,
			},
		];

		it("should include a block token if the text is wrapped in braces", () => {
			for (const { start, wantType, wantDetail } of tokenTypes) {
				const got = new LatexLexer(`${start}{hello}`).readToEnd();
				expect(got).toHaveLength(1);
				const [token] = got as [AccentToken | ScriptToken];

				const { content, literal, type, detail } = token;
				expect(type).toEqual(wantType);
				expect(detail).toEqual(wantDetail);
				expect(literal.startsWith(start));

				expect(content).toEqual({
					type: LatexTokenType.Block,
					literal: "{hello}",
					content: [
						{
							type: LatexTokenType.Content,
							literal: "hello",
							originalLength: 5,
						},
					],
				});
			}
		});

		it("should include a content token of the next character if the text is not wrapped", () => {
			for (const { start, wantType, wantDetail } of tokenTypes) {
				const got = new LatexLexer(`${start}nothing here`).readToEnd();
				expect(got).toHaveLength(2);
				const [token, otherContent] = got as [
					AccentToken | ScriptToken,
					ContentToken,
				];

				const { content, literal, type, detail } = token;
				expect(type).toEqual(wantType);
				expect(detail).toEqual(wantDetail);
				expect(literal.startsWith(start));

				expect(content).toEqual({
					type: LatexTokenType.Content,
					literal: "n",
					originalLength: 1,
				});

				expect(otherContent).toEqual({
					type: LatexTokenType.Content,
					literal: "othing here",
					originalLength: 11,
				});
			}
		});

		it("should correctly parse a following command token if a backslash follows", () => {
			for (const { start, wantType, wantDetail } of tokenTypes) {
				const got = new LatexLexer(`${start}\\command1{arg1}`).readToEnd();
				expect(got).toHaveLength(1);
				const [token] = got as [AccentToken | ScriptToken];

				const { content, literal, type, detail } = token;
				expect(type).toEqual(wantType);
				expect(detail).toEqual(wantDetail);
				expect(literal.startsWith(start));

				expect(content).toEqual({
					type: LatexTokenType.Command,
					literal: "\\command1{arg1}",
					name: "command1",
					arguments: [
						{
							type: LatexCommandArgumentType.Required,
							content: [
								{
									type: LatexTokenType.Content,
									literal: "arg1",
									originalLength: 4,
								},
							],
						},
					],
				});
			}
		});

		// TODO: Add more tests for failure conditions
		it("should throw if any other token type immediately follows", () => {
			for (const end of ["[hello]", "#1", "^"]) {
				for (const { start } of tokenTypes) {
					expect(() => new LatexLexer(`${start}${end}`).readToEnd()).toThrow();
				}
			}
		});
	});

	describe("escaped characters", () => {
		it("should properly escape characters that are escaped, no matter how nested", () => {
			const got = new LatexLexer(
				"100\\% \\command{\\$\\^{}\\~{}} \\_T {\\{Nested{\\{Double\\_ Nested}}",
			).readToEnd();

			expect(got.length).toEqual(4);

			const [content1, command, content2, block] = got;
			expect(content1).toEqual({
				type: LatexTokenType.Content,
				literal: "100% ",
				originalLength: 17,
			});

			expect(command).toEqual({
				type: LatexTokenType.Command,
				literal: "\\command{@@<!DOLLAR!>@@<!CARET!>@@<!TILDE!>}",
				name: "command",
				arguments: [
					{
						type: LatexCommandArgumentType.Required,
						content: [
							{
								type: LatexTokenType.Content,
								literal: "$^~",
								originalLength: 34,
							},
						],
					},
				],
			});

			expect(content2).toEqual({
				type: LatexTokenType.Content,
				literal: " _T ",
				originalLength: 19,
			});

			expect(block).toEqual({
				content: [
					{
						literal: "{Nested",
						originalLength: 18,
						type: LatexTokenType.Content,
					},
					{
						content: [
							{
								literal: "{Double_ Nested",
								originalLength: 41,
								type: LatexTokenType.Content,
							},
						],
						literal: "{@@<!LCURLY!>Double@@<!UNDERSCORE!> Nested}",
						type: LatexTokenType.Block,
					},
				],
				literal:
					"{@@<!LCURLY!>Nested{@@<!LCURLY!>Double@@<!UNDERSCORE!> Nested}}",
				type: LatexTokenType.Block,
			});
		});
	});

	describe("comments", () => {
		it("should encapsulate everything after the % until the end of line in a comment", () => {
			const got = new LatexLexer("% this is a comment \\\\").readToEnd();
			expect(got.length).toEqual(1);

			const [token] = got;
			expect(token).toEqual({
				type: LatexTokenType.Comment,
				content: " this is a comment \\\\",
				literal: "% this is a comment @@<!BACKSLASH!>",
			});
		});
	});

	describe("math", () => {
		const tokenTypes = [
			{
				start: "\\(",
				end: "\\)",
				wantPosition: MathPosition.Block,
			},
			{
				start: "\\[",
				end: "\\]",
				wantPosition: MathPosition.Centered,
			},
			{
				start: "$",
				end: "$",
				wantPosition: MathPosition.Inline,
			},
		];

		it("should encapsulate everything that occurs between the start and end sequences", () => {
			for (const { start, end, wantPosition } of tokenTypes) {
				const got = new LatexLexer(`${start}e = mc^2${end}`).readToEnd();
				expect(got).toHaveLength(1);
				const [token] = got as [MathToken];
				expect(token.type).toEqual(LatexTokenType.Math);
				expect(token.position).toEqual(wantPosition);

				expect(token.literal).toEqual(
					`${start}e = mc^2${end}` as `\\(${string}\\)`,
				);
				expect(token.content).toEqual([
					{
						type: LatexTokenType.Content,
						literal: "e = mc",
						originalLength: 6,
					},
					{
						type: LatexTokenType.Script,
						detail: ScriptTokenType.Super,
						literal: "^2",
						content: {
							type: LatexTokenType.Content,
							literal: "2",
							originalLength: 1,
						},
					},
				]);
			}
		});

		it("should throw if the block is not closed correctly", () => {
			for (const { start } of tokenTypes) {
				expect(() => new LatexLexer(`${start}e = mc^2`).readToEnd()).toThrow();
			}
		});
	});

	// TODO: Add a test to test all features working together in unison

	describe("insert", () => {
		it("should insert items into the lexer's input", () => {
			const got = lexer.insert(1, "somecommand \\somecommand2 ");

			const tokens = got.readToEnd();

			const want: LatexToken[] = [
				{
					arguments: [],
					literal: "\\somecommand",
					name: "somecommand",
					type: LatexTokenType.Command,
				},
				{
					literal: " ",
					originalLength: 1,
					type: LatexTokenType.Content,
				},
				{
					arguments: [],
					literal: "\\somecommand2",
					name: "somecommand2",
					type: LatexTokenType.Command,
				},
				{
					literal: " documentclass[12pt]",
					originalLength: 20,
					type: LatexTokenType.Content,
				},
				{
					content: [
						{
							literal: "article",
							originalLength: 7,
							type: LatexTokenType.Content,
						},
					],
					literal: "{article}",
					type: LatexTokenType.Block,
				},
			];
			expect(tokens).toEqual(want);
		});

		it("should insert by distance from the end if the position is negative", () => {
			const got = lexer.insert(-1, "fast:introduction").readToEnd();
			const want: LatexToken[] = [
				{
					arguments: [
						{
							content: {
								literal: "12pt",
								originalLength: 4,
								type: LatexTokenType.Content,
							},
							type: LatexCommandArgumentType.Optional,
						},
						{
							content: [
								{
									literal: "articlefast:introduction",
									originalLength: 24,
									type: LatexTokenType.Content,
								},
							],
							type: LatexCommandArgumentType.Required,
						},
					],
					literal: "\\documentclass[12pt]{articlefast:introduction}",
					name: "documentclass",
					type: LatexTokenType.Command,
				},
			];
			expect(got).toEqual(want);
		});

		it("should insert at the beginning for a sufficiently large negative value", () => {
			const got = lexer.insert(-10000, "\\somecommand ").readToEnd();
			const want: LatexToken[] = [
				{
					literal: "\\somecommand",
					name: "somecommand",
					type: LatexTokenType.Command,
					arguments: [],
				},
				{
					literal: " ",
					type: LatexTokenType.Content,
					originalLength: 1,
				},
				{
					arguments: [
						{
							content: {
								literal: "12pt",
								originalLength: 4,
								type: LatexTokenType.Content,
							},
							type: LatexCommandArgumentType.Optional,
						},
						{
							content: [
								{
									literal: "article",
									originalLength: 7,
									type: LatexTokenType.Content,
								},
							],
							type: LatexCommandArgumentType.Required,
						},
					],
					literal: "\\documentclass[12pt]{article}",
					name: "documentclass",
					type: LatexTokenType.Command,
				},
			];
			expect(got).toEqual(want);
		});

		it("should insert at the end for a sufficiently large positive value", () => {
			const got = lexer.insert(1000, " \\$").readToEnd();

			const want: LatexToken[] = [
				{
					arguments: [
						{
							content: {
								literal: "12pt",
								originalLength: 4,
								type: LatexTokenType.Content,
							},
							type: LatexCommandArgumentType.Optional,
						},
						{
							content: [
								{
									literal: "article",
									originalLength: 7,
									type: LatexTokenType.Content,
								},
							],
							type: LatexCommandArgumentType.Required,
						},
					],
					literal: "\\documentclass[12pt]{article}",
					name: "documentclass",
					type: LatexTokenType.Command,
				},
				{
					type: LatexTokenType.Content,
					literal: " $",
					originalLength: 13,
				},
			];
			expect(got).toEqual(want);
		});

		describe("cursor positioning", () => {
			let lexer: LatexLexer;
			beforeEach(() => {
				lexer = new LatexLexer("a&b&c&d&e");
			});

			it("should move the cursor position forward by the moved amount if the position was at leat at the start of the inserted items", () => {
				lexer.seek(2);
				const want = lexer.peek();

				lexer.insert(1, "&f&g");
				const got = lexer.peek();

				expect(want).toEqual(got);
				expect(want).toEqual({
					type: LatexTokenType.Content,
					literal: "b",
					originalLength: 1,
				});

				const remainingTokens = [...lexer];
				expect(remainingTokens).toEqual([
					{
						literal: "b",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "c",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "d",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "e",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
				]);
			});

			it("should keep the cursor at the same position if it was not at that position yet", () => {
				lexer.seek(2);
				const want = lexer.peek();

				lexer.insert(1000, "&f&g");
				const got = lexer.peek();

				expect(want).toEqual(got);
				expect(want).toEqual({
					type: LatexTokenType.Content,
					literal: "b",
					originalLength: 1,
				});

				const restOfTokens = [...lexer];
				expect(restOfTokens).toEqual([
					{
						literal: "b",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "c",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "d",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "e",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "f",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
					{
						literal: "&",
						type: LatexTokenType.ColumnAlign,
					},
					{
						literal: "g",
						originalLength: 1,
						type: LatexTokenType.Content,
					},
				]);
			});
		});
	});

	describe("remove", () => {
		it("should remove the segment from the lexer's input", () => {
			const got = lexer.remove(1, 9).readToEnd();
			const want: LatexToken[] = [
				{
					arguments: [
						{
							content: {
								literal: "12pt",
								originalLength: 4,
								type: LatexTokenType.Content,
							},
							type: LatexCommandArgumentType.Optional,
						},
						{
							content: [
								{
									literal: "article",
									originalLength: 7,
									type: LatexTokenType.Content,
								},
							],
							type: LatexCommandArgumentType.Required,
						},
					],
					literal: "\\class[12pt]{article}",
					name: "class",
					type: LatexTokenType.Command,
				},
			];

			expect(got).toEqual(want);
		});

		it("should remove the segment from the lexer's input when the start value is negative", () => {
			const got = lexer.remove(-100, 9).readToEnd();
			const want: LatexToken[] = [
				{
					literal: "class[12pt]",
					originalLength: 11,
					type: LatexTokenType.Content,
				},
				{
					content: [
						{
							literal: "article",
							originalLength: 7,
							type: LatexTokenType.Content,
						},
					],
					literal: "{article}",
					type: LatexTokenType.Block,
				},
			];
			expect(got).toEqual(want);
		});

		it("should reverse the start and end values if the start value is greater than the end value", () => {
			lexer.remove(9, -100);
			const got = [...lexer];
			const want: LatexToken[] = [
				{
					content: [
						{
							literal: "article",
							originalLength: 7,
							type: LatexTokenType.Content,
						},
					],
					literal: "{article}",
					type: LatexTokenType.Block,
				},
				{
					literal: "class[12pt]",
					originalLength: 11,
					type: LatexTokenType.Content,
				},
				{
					content: [
						{
							literal: "article",
							originalLength: 7,
							type: LatexTokenType.Content,
						},
					],
					literal: "{article}",
					type: LatexTokenType.Block,
				},
			];
			expect(got).toEqual(want);
		});

		it("should remove to the end of the document if the end value is very large", () => {
			lexer.remove(9, 10000);
			const got = [...lexer];
			const want: LatexToken[] = [
				{
					arguments: [],
					literal: "\\document",
					name: "document",
					type: LatexTokenType.Command,
				},
			];
			expect(got).toEqual(want);
		});

		it("should not alter the doc if the start and end values are the same", () => {
			lexer.remove(9, 9);
			const got = [...lexer];
			const want: LatexToken[] = [
				{
					arguments: [
						{
							content: {
								literal: "12pt",
								originalLength: 4,
								type: LatexTokenType.Content,
							},
							type: LatexCommandArgumentType.Optional,
						},
						{
							content: [
								{
									literal: "article",
									originalLength: 7,
									type: LatexTokenType.Content,
								},
							],
							type: LatexCommandArgumentType.Required,
						},
					],
					literal: "\\documentclass[12pt]{article}",
					name: "documentclass",
					type: LatexTokenType.Command,
				},
			];

			expect(got).toEqual(want);
		});
	});
});
