import { it, expect, describe } from "bun:test";

import { Lexer } from "./lexer";

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
    \\centering
    \\begin{tabular}{|c|c|c|}
    \\hline
    Column 1 & Column 2 & Column 3 \\\\
    \\hline
    Data 1 & Data 2 & Data 3 \\\\
    Data 4 & Data 5 & Data 6 \\\\
    \\hline
    \\end{tabular}
    \\caption{Sample Table}
    \\label{tab:sample}
\\end{table}

\\section{Conclusion}

This document demonstrates basic LaTeX formatting.

\\end{document}`;

describe("Lexer", () => {
  it("should correctly lex a latex document", () => {
    const lexer = new Lexer(LATEX_DOC);
    const got = [...lexer];
  });
});
