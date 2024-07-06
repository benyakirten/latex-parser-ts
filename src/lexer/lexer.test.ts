/* eslint-disable @typescript-eslint/no-unused-vars */
import { it, expect, describe, beforeEach, jest } from "bun:test";

import { LatexLexer } from "./lexer";
import {
  LatexTokenType,
  LatexCommandArgumentType,
  type LexerCache,
  type LatexToken,
  type CommandToken,
  type ContentToken,
  type RequiredArgument,
  type OptionalArgument,
  type LabeledArgContent,
  type CommentToken,
  type PlaceholderToken,
} from "./types";

const FULL_LATEX_DOC = `\\documentclass[12pt]{article}
\\( E = mc^2 \\). And here is a displayed equation:
\\[
\\int_a^b f(x)\\,dx
\\]
\\\tbegin{figure:sample}[h]
\\includegraphics[width=0.5\\textwidth]{example.jpg}`;

const SHORT_LATEX_DOC = `\\documentclass[12pt]{article}`;

describe("LatexLexer", () => {
  describe("command", () => {
    // it("should lex a command with no arguments", () => {
    //   const got = new LatexLexer("\\command").readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;
    //   expect(token).toEqual({ type: LatexTokenType.Command, literal: "\\command", arguments: [] });
    // });

    // it("should be able to lex a command with a simple required argument", () => {
    //   const got = new LatexLexer("\\command{arg}").readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;
    //   const contentArg: ContentToken = {
    //     type: LatexTokenType.Content,
    //     literal: "arg",
    //     originalLength: 3,
    //   };
    //   const wantArg: RequiredArgument = {
    //     type: LatexCommandArgumentType.Required,
    //     content: [contentArg],
    //   };

    //   expect(token).toEqual({
    //     type: LatexTokenType.Command,
    //     literal: "\\command{arg}",
    //     arguments: [wantArg],
    //   });
    // });

    // it("should be able to lex a command with a required argument that's a nested command", () => {
    //   const got = new LatexLexer("\\command{\\command2}").readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;
    //   const commandArg: CommandToken = {
    //     type: LatexTokenType.Command,
    //     literal: "\\command2",
    //     arguments: [],
    //   };
    //   const wantArg: RequiredArgument = {
    //     type: LatexCommandArgumentType.Required,
    //     content: [commandArg],
    //   };

    //   expect(token).toEqual({
    //     type: LatexTokenType.Command,
    //     literal: "\\command{\\command2}",
    //     arguments: [wantArg],
    //   });
    // });

    // it("should be able to lex a command with a required argument with nested arguments", () => {
    //   const got = new LatexLexer("\\command{\\command2{arg1}{\\command3}}").readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;

    //   const nestedArg1: ContentToken = {
    //     type: LatexTokenType.Content,
    //     literal: "arg1",
    //     originalLength: 4,
    //   };
    //   const nestedRequiredArg1: RequiredArgument = {
    //     type: LatexCommandArgumentType.Required,
    //     content: [nestedArg1],
    //   };

    //   const nestedArg2: CommandToken = {
    //     type: LatexTokenType.Command,
    //     literal: "\\command3",
    //     arguments: [],
    //   };
    //   const nestedRequiredArg2: RequiredArgument = {
    //     type: LatexCommandArgumentType.Required,
    //     content: [nestedArg2],
    //   };

    //   const topCommandArg: CommandToken = {
    //     type: LatexTokenType.Command,
    //     literal: "\\command2{arg1}{\\command3}",
    //     arguments: [nestedRequiredArg1, nestedRequiredArg2],
    //   };

    //   const wantArg: RequiredArgument = {
    //     type: LatexCommandArgumentType.Required,
    //     content: [topCommandArg],
    //   };

    //   expect(token).toEqual({
    //     type: LatexTokenType.Command,
    //     literal: "\\command{\\command2{arg1}{\\command3}}",
    //     arguments: [wantArg],
    //   });
    // });

    // it("should be able to lex a command with a simple optional argument", () => {
    //   const got = new LatexLexer("\\command[arg]").readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;
    //   const contentArg: ContentToken = {
    //     type: LatexTokenType.Content,
    //     literal: "arg",
    //     originalLength: 3,
    //   };
    //   const optionalArg: OptionalArgument = {
    //     type: LatexCommandArgumentType.Optional,
    //     content: contentArg,
    //   };

    //   expect(token).toEqual({
    //     type: LatexTokenType.Command,
    //     literal: "\\command[arg]",
    //     arguments: [optionalArg],
    //   });
    // });

    // it("should be lex an optional argument with commas as one content token", () => {
    //   const got = new LatexLexer("\\command[a,b,c]").readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;
    //   const contentArg: ContentToken = {
    //     type: LatexTokenType.Content,
    //     literal: "a,b,c",
    //     originalLength: 5,
    //   };
    //   const optionalArg: OptionalArgument = {
    //     type: LatexCommandArgumentType.Optional,
    //     content: contentArg,
    //   };

    //   expect(token).toEqual({
    //     type: LatexTokenType.Command,
    //     literal: "\\command[a,b,c]",
    //     arguments: [optionalArg],
    //   });
    // });

    it("should be able to lex commands with multiple labeled optional arguments", () => {
      const got = new LatexLexer("\\command[a=b,c=d,e=\\command2,f=g]").readToEnd();
      expect(got).toHaveLength(1);

      const [token] = got;
      // for (const { key, value } of token.arguments[0].content) {
      //   console.log("REP");
      //   console.log(key);
      //   console.log(value);
      // }
      // const labeledArg1: LabeledArgContent = {
      //   key: "a",
      //   value: [
      //     {
      //       type: LatexTokenType.Content,
      //       literal: "b",
      //       originalLength: 1,
      //     },
      //   ],
      // };

      // const labeledArg2: LabeledArgContent = {
      //   key: "c",
      //   value: [
      //     {
      //       type: LatexTokenType.Command,
      //       literal: "\\command2",
      //       arguments: [],
      //     },
      //   ],
      // };
      // const optionalArgs: LabeledArgContent[] = [labeledArg1, labeledArg2];

      // const optionalArg: OptionalArgument = {
      //   type: LatexCommandArgumentType.Optional,
      //   content: optionalArgs,
      // };

      // expect(token).toEqual({
      //   type: LatexTokenType.Command,
      //   literal: "\\command[a=b,c=\\command2]",
      //   arguments: [optionalArg],
      // });
    });

    // it("should be able to lex a new macro command that's written over multiple lines", () => {
    //   const command = `\\newcommand{\\mycommand}[2]{%\n  First argument: #1 \\\\\n  Second argument: #2}`;
    //   const got = new LatexLexer(command).readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;
    //   const firstArg: RequiredArgument = {
    //     type: LatexCommandArgumentType.Required,
    //     content: [
    //       {
    //         type: LatexTokenType.Command,
    //         literal: "\\mycommand",
    //         arguments: [],
    //       },
    //     ],
    //   };

    //   const contentToken: ContentToken = {
    //     type: LatexTokenType.Content,
    //     literal: "2",
    //     originalLength: 1,
    //   };
    //   const secondArg: OptionalArgument = {
    //     type: LatexCommandArgumentType.Optional,
    //     content: contentToken,
    //   };

    //   const commentToken: CommentToken = {
    //     type: LatexTokenType.Comment,
    //     literal: "%\n",
    //     content: "",
    //   };
    //   const firstContentToken: ContentToken = {
    //     type: LatexTokenType.Content,
    //     literal: "  First argument: ",
    //     originalLength: 18,
    //   };
    //   const firstPlaceholderToken: PlaceholderToken = {
    //     type: LatexTokenType.Placeholder,
    //     literal: "#1",
    //     content: 1,
    //   };
    //   const secondContentToken: ContentToken = {
    //     type: LatexTokenType.Content,
    //     literal: " Second argument: ",
    //     originalLength: 18,
    //   };
    //   const secondPlaceholderToken: PlaceholderToken = {
    //     type: LatexTokenType.Placeholder,
    //     literal: "#2",
    //     content: 2,
    //   };
    //   const thirdArg: RequiredArgument = {
    //     type: LatexCommandArgumentType.Required,
    //     content: [
    //       commentToken,
    //       firstContentToken,
    //       firstPlaceholderToken,
    //       secondContentToken,
    //       secondPlaceholderToken,
    //     ],
    //   };

    //   const want: CommandToken = {
    //     type: LatexTokenType.Command,
    //     literal:
    //       "\\newcommand{\\mycommand}[2]{%\n  First argument: #1 @@<!BACKSLASH!>\n  Second argument: #2}",
    //     arguments: [firstArg, secondArg, thirdArg],
    //   };

    //   expect(token).toEqual(want);
    // });

    // it("should be able to lex a command of arbitrary complexity", () => {
    //   const command = `\\newcommand{\\mycommand}[\\mycommand2[2]{\\command3[a=b,b=\\arg1{%\nCool Th_in^g: #1}[a=^7,b=c,d=e],c=d]}]`;
    //   const got = new LatexLexer(command).readToEnd();
    //   expect(got).toHaveLength(1);

    //   const [token] = got;
    // });
  });
  // it("should correctly lex a latex document", () => {
  //   const lexer = new LatexLexer(FULL_LATEX_DOC);
  //   const want: LatexToken[] = [
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.Content, literal: "documentclass" },
  //     { type: LatexTokenType.LBracket, literal: "[" },
  //     { type: LatexTokenType.Content, literal: "12pt" },
  //     { type: LatexTokenType.RBracket, literal: "]" },
  //     { type: LatexTokenType.LBrace, literal: "{" },
  //     { type: LatexTokenType.Content, literal: "article" },
  //     { type: LatexTokenType.RBrace, literal: "}" },
  //     { type: LatexTokenType.EndOfLine, literal: "\n" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.LParen, literal: "(" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "E" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "=" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "mc" },
  //     { type: LatexTokenType.Caret, literal: "^" },
  //     { type: LatexTokenType.Content, literal: "2" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.RParen, literal: ")" },
  //     { type: LatexTokenType.Content, literal: "." },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "And" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "here" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "is" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "a" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "displayed" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "equation:" },
  //     { type: LatexTokenType.EndOfLine, literal: "\n" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.LBracket, literal: "[" },
  //     { type: LatexTokenType.EndOfLine, literal: "\n" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.Content, literal: "int" },
  //     { type: LatexTokenType.Underscore, literal: "_" },
  //     { type: LatexTokenType.Content, literal: "a" },
  //     { type: LatexTokenType.Caret, literal: "^" },
  //     { type: LatexTokenType.Content, literal: "b" },
  //     { type: LatexTokenType.Space, literal: " " },
  //     { type: LatexTokenType.Content, literal: "f" },
  //     { type: LatexTokenType.LParen, literal: "(" },
  //     { type: LatexTokenType.Content, literal: "x" },
  //     { type: LatexTokenType.RParen, literal: ")" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.Content, literal: ",dx" },
  //     { type: LatexTokenType.EndOfLine, literal: "\n" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.RBracket, literal: "]" },
  //     { type: LatexTokenType.EndOfLine, literal: "\n" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.Tab, literal: "\t" },
  //     { type: LatexTokenType.Content, literal: "begin" },
  //     { type: LatexTokenType.LBrace, literal: "{" },
  //     { type: LatexTokenType.Content, literal: "figure:sample" },
  //     { type: LatexTokenType.RBrace, literal: "}" },
  //     { type: LatexTokenType.LBracket, literal: "[" },
  //     { type: LatexTokenType.Content, literal: "h" },
  //     { type: LatexTokenType.RBracket, literal: "]" },
  //     { type: LatexTokenType.EndOfLine, literal: "\n" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.Content, literal: "includegraphics" },
  //     { type: LatexTokenType.LBracket, literal: "[" },
  //     { type: LatexTokenType.Content, literal: "width=0.5" },
  //     { type: LatexTokenType.BackSlash, literal: "\\" },
  //     { type: LatexTokenType.Content, literal: "textwidth" },
  //     { type: LatexTokenType.RBracket, literal: "]" },
  //     { type: LatexTokenType.LBrace, literal: "{" },
  //     { type: LatexTokenType.Content, literal: "example.jpg" },
  //     { type: LatexTokenType.RBrace, literal: "}" },
  //   ];
  //   const got = [...lexer];
  //   expect(got).toEqual(want);
  // });
  // describe("peek", () => {
  //   it("should read the next token without advancing the lexer", () => {
  //     const got = lexer.peek();
  //     expect(got).toEqual({ type: LatexTokenType.BackSlash, literal: "\\" });
  //     const got2 = lexer.peek();
  //     expect(got2).toEqual({ type: LatexTokenType.BackSlash, literal: "\\" });
  //   });
  //   it("should be able to peek multiple characters in advance", () => {
  //     const got1 = lexer.peek(1);
  //     expect(got1).toEqual({ type: LatexTokenType.Content, literal: "documentclass" });
  //     const got2 = lexer.peek(14);
  //     expect(got2).toEqual({ type: LatexTokenType.LBracket, literal: "[" });
  //   });
  // });
  // describe("seek", () => {
  //   it("should correctly set the position based off the seek method", () => {
  //     lexer.seek(1);
  //     let got = lexer.nextToken();
  //     expect(got).toEqual({ type: LatexTokenType.Content, literal: "documentclass" });
  //     lexer.seek(0);
  //     got = lexer.nextToken();
  //     expect(got).toEqual({ type: LatexTokenType.BackSlash, literal: "\\" });
  //     lexer.seek(30);
  //     got = lexer.nextToken();
  //     expect(got).toEqual({ type: LatexTokenType.EOF, literal: "" });
  //   });
  //   it("if the seek value is less than 0 then it should set the position to the end minus the distance parameter", () => {
  //     lexer.seek(-8);
  //     let got = lexer.nextToken();
  //     expect(got).toEqual({ type: LatexTokenType.Content, literal: "article" });
  //     lexer.seek(-8);
  //     got = lexer.nextToken();
  //     expect(got).toEqual({ type: LatexTokenType.Content, literal: "article" });
  //   });
  //   it("should set the read position to the beginning of the document if the seek position is a negative number greater than the document's length", () => {
  //     lexer.seek(-10000);
  //     const got = lexer.nextToken();
  //     expect(got).toEqual({ type: LatexTokenType.BackSlash, literal: "\\" });
  //   });
  //   it("should set the position to the end of the document if the seek position is longer than the document's length", () => {
  //     lexer.seek(1000000);
  //     const got = lexer.nextToken();
  //     expect(got).toEqual({ type: LatexTokenType.EOF, literal: "" });
  //   });
  // });
  // describe("insert", () => {
  //   it("should insert items into the lexer's input", () => {
  //     const gotIter = lexer.insert(1, "somecommand\\");
  //     const wantIter = (function* () {
  //       yield { type: LatexTokenType.Content, literal: "somecommand" };
  //       yield { type: LatexTokenType.BackSlash, literal: "\\" };
  //     })();
  //     for (const gotToken of gotIter) {
  //       const wantToken = wantIter.next().value;
  //       expect(wantToken).toEqual(gotToken);
  //     }
  //     const gotLexedItems = [...lexer];
  //     const wantLexedItems: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "somecommand" },
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "documentclass" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(gotLexedItems).toEqual(wantLexedItems);
  //   });
  //   it("should insert by distance from the end if the position is negative", () => {
  //     lexer.insert(-1, "fast:introduction");
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "documentclass" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "articlefast:introduction" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  //   it("should insert at the beginning for a sufficiently large negative value", () => {
  //     lexer.insert(-10000, "\\somecommand");
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "somecommand" },
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "documentclass" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  //   it("should insert at the end for a sufficiently large positive value", () => {
  //     lexer.insert(1000, "$");
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "documentclass" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //       { type: LatexTokenType.Dollar, literal: "$" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  // });
  // describe("remove", () => {
  //   it("should remove the segment from the lexer's input", () => {
  //     lexer.remove(1, 9);
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "class" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  //   it("should remove the segment from the lexer's input when the start value is negative", () => {
  //     lexer.remove(-100, 9);
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.Content, literal: "class" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  //   it("should reverse the start and end values if the start value is greater than the end value", () => {
  //     lexer.remove(9, -100);
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.Content, literal: "class" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  //   it("should be able to handle a negative start and end value", () => {
  //     lexer.remove(-100, -50);
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "documentclass" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  //   it("should remove to the end of the document if the end value is very large", () => {
  //     lexer.remove(9, 10000);
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "document" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  //   it("should not alter the doc if the start and end values are the same", () => {
  //     lexer.remove(9, 9);
  //     const got = [...lexer];
  //     const want: LatexToken[] = [
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //       { type: LatexTokenType.Content, literal: "documentclass" },
  //       { type: LatexTokenType.LBracket, literal: "[" },
  //       { type: LatexTokenType.Content, literal: "12pt" },
  //       { type: LatexTokenType.RBracket, literal: "]" },
  //       { type: LatexTokenType.LBrace, literal: "{" },
  //       { type: LatexTokenType.Content, literal: "article" },
  //       { type: LatexTokenType.RBrace, literal: "}" },
  //     ];
  //     expect(got).toEqual(want);
  //   });
  // });
  // describe("caching", () => {
  //   const insertSpy = jest.fn();
  //   const removeSpy = jest.fn();
  //   const addSpy = jest.fn();
  //   const getSpy = jest.fn();
  //   const evictSpy = jest.fn();
  //   class MockCache implements LexerCache {
  //     public remove(start: number, end: number): LexerCache {
  //       removeSpy(start, end);
  //       return this;
  //     }
  //     public add(start: number, token: LatexToken): LexerCache {
  //       addSpy(start, token);
  //       return this;
  //     }
  //     public get(position: number): LatexToken | null {
  //       return getSpy(position);
  //     }
  //     insert(position: number, token: LatexToken[]): LexerCache {
  //       insertSpy(position, token);
  //       return this;
  //     }
  //     evict(start: number, end: number): LexerCache {
  //       evictSpy(start, end);
  //       return this;
  //     }
  //   }
  //   let lexer: LatexLexer;
  //   beforeEach(() => {
  //     insertSpy.mockClear();
  //     removeSpy.mockClear();
  //     addSpy.mockClear();
  //     getSpy.mockClear();
  //     evictSpy.mockClear();
  //     getSpy.mockReturnValue(null);
  //     lexer = new LatexLexer(SHORT_LATEX_DOC, new MockCache());
  //   });
  //   it("should call insert with the lexed items when insert is called", () => {
  //     lexer.insert(1, "somecommand\\");
  //     expect(insertSpy).toHaveBeenCalledTimes(1);
  //     expect(insertSpy).toHaveBeenCalledWith(1, [
  //       { type: LatexTokenType.Content, literal: "somecommand" },
  //       { type: LatexTokenType.BackSlash, literal: "\\" },
  //     ]);
  //   });
  //   it("should call remove on the cache with the same start and end values when remove is called", () => {
  //     lexer.remove(1, 9);
  //     expect(removeSpy).toHaveBeenCalledTimes(1);
  //     expect(removeSpy).toHaveBeenCalledWith(1, 9);
  //   });
  //   it("should call remove with the adjusted values when remove is called with irregular values", () => {
  //     lexer.remove(9, -100);
  //     expect(removeSpy).toHaveBeenCalledTimes(1);
  //     expect(removeSpy).toHaveBeenCalledWith(0, 9);
  //   });
  //   it("should attempt to get the token from the cache when nextToken is called", () => {
  //     lexer.nextToken();
  //     expect(getSpy).toHaveBeenCalledTimes(1);
  //     expect(getSpy).toHaveBeenCalledWith(0);
  //   });
  //   it("should add the token to the cache when nextToken is called and the value does not exist in the cache", () => {
  //     getSpy.mockReturnValue(null);
  //     lexer.nextToken();
  //     expect(addSpy).toHaveBeenCalledTimes(1);
  //     expect(addSpy).toHaveBeenCalledWith(0, { type: LatexTokenType.BackSlash, literal: "\\" });
  //   });
  //   it("should not add the token to the cache when nextToken is called and the value exists in the cache", () => {
  //     getSpy.mockReturnValue({ type: LatexTokenType.BackSlash, literal: "\\" });
  //     lexer.nextToken();
  //     expect(addSpy).not.toHaveBeenCalled();
  //   });
  // });
});
