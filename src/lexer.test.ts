import { it, expect, describe } from "bun:test";

import { Lexer } from "./lexer";
import { TokenType, type Token } from "./types";

const LATEX_DOC = `\\documentclass[12pt]{article}
\\( E = mc^2 \\). And here is a displayed equation:
\\[
\\int_a^b f(x)\\,dx
\\]
\\begin{figure}[h]
    \\centering
    \\includegraphics[width=0.5\\textwidth]{example.jpg}
    \\caption{Sample Image}
    \\label{fig:sample}
\\end{figure}

\\begin{table}[h]
    \\begin{tabular}{|c|c|c|}
    \\hline
    Column 1 & Column 2 & Column 3 \\\\
    \\label{tab:sample}
\\end{table}`;

describe("Lexer", () => {
  it("should correctly lex a latex document", () => {
    const lexer = new Lexer(LATEX_DOC);

    const want: Token[] = [{ type: TokenType.BackSlash, literal: "\\" }];
    const got = [...lexer];

    expect(got).toEqual(want);
  });
});
