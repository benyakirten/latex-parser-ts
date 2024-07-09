import { describe, expect, it, test } from "bun:test";

import {
  type CommandToken,
  LatexCommandArgumentType,
  LatexTokenType,
} from "../../../lexer/types";
import {
  type AuthorCommand,
  AuthorCommandType,
  FontValueType,
  type LatexAuthorDefaults,
  LatexFontShapeValue,
  LatexFontSizeUnit,
  LatexFontWeight,
  LatexFontWidth,
} from "../types";
import { parseAuthorCommand, setFontDefaults } from "./author";

describe("parseAuthorCommand", () => {
  test.each<[AuthorCommand | null, string]>([
    [null, "unknown"],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "normal",
      },
      "textnormal",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "normal",
      },
      "textnormal",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "normal",
      },
      "normalfont",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "serif",
      },
      "textrm",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "serif",
      },
      "rmfamily",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "sans",
      },
      "textsf",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "sans",
      },
      "sffamily",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "monospace",
      },
      "texttt",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "monospace",
      },
      "ttfamily",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "medium",
      },
      "textmd",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "medium",
      },
      "mdseries",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "bold",
      },
      "textbf",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "bold",
      },
      "bfseries",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "italics",
      },
      "textit",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "italics",
      },
      "itshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "oblique",
      },
      "textsl",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "oblique",
      },
      "slshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "swash",
      },
      "textsw",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "swash",
      },
      "swshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "lowercase",
      },
      "textulc",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "lowercase",
      },
      "ulcshape",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "upcase",
      },
      "textup",
    ],
    [
      {
        type: AuthorCommandType.AuthorDefault,
        value: "upcase",
      },
      "upshape",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 5, unit: LatexFontSizeUnit.Point },
        },
      },
      "tiny",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 7, unit: LatexFontSizeUnit.Point },
        },
      },
      "scriptsize",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 8, unit: LatexFontSizeUnit.Point },
        },
      },
      "footnotesize",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 10, unit: LatexFontSizeUnit.Point },
        },
      },
      "normalsize",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 12, unit: LatexFontSizeUnit.Point },
        },
      },
      "large",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 14.4, unit: LatexFontSizeUnit.Point },
        },
      },
      "Large",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 17.28, unit: LatexFontSizeUnit.Point },
        },
      },
      "LARGE",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 20.74, unit: LatexFontSizeUnit.Point },
        },
      },
      "huge",
    ],
    [
      {
        type: AuthorCommandType.FontSize,
        value: {
          type: FontValueType.FontValue,
          value: { value: 24.88, unit: LatexFontSizeUnit.Point },
        },
      },
      "Huge",
    ],
  ])("should return %o given %s", (want, input) => {
    const got = parseAuthorCommand(input);
    expect(got).toEqual(want);
  });
});

describe("setFontDefaults", () => {
  it("should throw an error if the command is not renewcommand", () => {
    const renewCommand: CommandToken = {
      type: LatexTokenType.Command,
      literal: "\\notrenewcommand",
      name: "notrenewcommand",
      arguments: [
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Command,
              literal: "\\defaultrm",
              name: "defaultrm",
              arguments: [],
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "bx",
              originalLength: 2,
            },
          ],
        },
      ],
    };
    expect(() => setFontDefaults(renewCommand)).toThrow();
  });

  it("should throw an error if the number of arguments is not 2", () => {
    const renewCommand: CommandToken = {
      type: LatexTokenType.Command,
      literal: "\\renewcommand",
      name: "renewcommand",
      arguments: [],
    };
    expect(() => setFontDefaults(renewCommand)).toThrow();
  });

  it("should throw an error if the first argument is not a command", () => {
    const renewCommand: CommandToken = {
      type: LatexTokenType.Command,
      literal: "\\renewcommand",
      name: "renewcommand",
      arguments: [
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "bx",
              originalLength: 2,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Command,
              literal: "\\defaultrm",
              name: "defaultrm",
              arguments: [],
            },
          ],
        },
      ],
    };
    expect(() => setFontDefaults(renewCommand)).toThrowError(
      "First required argument must be a command",
    );
  });

  it("should throw an error if the second argument is not a command or argument", () => {
    const renewCommand: CommandToken = {
      type: LatexTokenType.Command,
      literal: "\\renewcommand",
      name: "renewcommand",
      arguments: [
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Command,
              literal: "\\rmdefault",
              name: "rmdefault",
              arguments: [],
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Placeholder,
              literal: "#1",
              content: 1,
            },
          ],
        },
      ],
    };
    expect(() => setFontDefaults(renewCommand)).toThrow();
  });

  test.each<[LatexAuthorDefaults, string, string]>([
    [
      {
        serif: {
          type: FontValueType.FontValue,
          value: "myserif",
        },
      },
      "rmdefault",
      "myserif",
    ],
    [
      {
        sans: {
          type: FontValueType.FontValue,
          value: "mysans",
        },
      },
      "sfdefault",
      "mysans",
    ],
    [
      {
        monospace: {
          type: FontValueType.FontValue,
          value: "mymonospace",
        },
      },
      "ttdefault",
      "mymonospace",
    ],
    [
      {
        family: {
          type: FontValueType.FontValue,
          value: "myfont",
        },
      },
      "familydefault",
      "myfont",
    ],
    [
      {
        bold: {
          type: FontValueType.FontValue,
          value: {
            width: LatexFontWidth.Expanded,
            weight: LatexFontWeight.Bold,
          },
        },
      },
      "bfdefault",
      "bx",
    ],
    [
      {
        series: {
          type: FontValueType.FontValue,
          value: {
            width: LatexFontWidth.Expanded,
            weight: LatexFontWeight.Bold,
          },
        },
      },
      "seriesdefault",
      "bx",
    ],
    [
      {
        medium: {
          type: FontValueType.FontValue,
          value: {
            width: LatexFontWidth.Expanded,
            weight: LatexFontWeight.Bold,
          },
        },
      },
      "mddefault",
      "bx",
    ],
    [
      {
        shape: {
          type: FontValueType.FontValue,
          value: LatexFontShapeValue.Italic,
        },
      },
      "shapedefault",
      "it",
    ],
    [
      {
        italics: {
          type: FontValueType.FontValue,
          value: LatexFontShapeValue.Italic,
        },
      },
      "itdefault",
      "it",
    ],
    [
      {
        smallCaps: {
          type: FontValueType.FontValue,
          value: LatexFontShapeValue.Italic,
        },
      },
      "scdefault",
      "it",
    ],
    [
      {
        spacedSmallCaps: {
          type: FontValueType.FontValue,
          value: LatexFontShapeValue.Italic,
        },
      },
      "sscdefault",
      "it",
    ],
    [
      {
        swash: {
          type: FontValueType.FontValue,
          value: LatexFontShapeValue.Italic,
        },
      },
      "swdefault",
      "it",
    ],
    [
      {
        oblique: {
          type: FontValueType.FontValue,
          value: LatexFontShapeValue.Italic,
        },
      },
      "sldefault",
      "it",
    ],
  ])(
    "should return $o given a command name of %s and a value of %s",
    (want, commandName, value) => {
      const renewCommand: CommandToken = {
        type: LatexTokenType.Command,
        literal: "\\renewcommand",
        name: "renewcommand",
        arguments: [
          {
            type: LatexCommandArgumentType.Required,
            content: [
              {
                type: LatexTokenType.Command,
                literal: `\\${commandName}`,
                name: `${commandName}`,
                arguments: [],
              },
            ],
          },
          {
            type: LatexCommandArgumentType.Required,
            content: [
              {
                type: LatexTokenType.Content,
                literal: value,
                originalLength: value.length,
              },
            ],
          },
        ],
      };

      const got = setFontDefaults(renewCommand);
      expect(got).toEqual(want);
    },
  );
});
