import { describe, it, expect } from "bun:test";

import { parseDeclareFixedFont } from "./declarations";
import { LatexTokenType, LatexCommandArgumentType, type CommandToken } from "../../../lexer/types";
import {
  FontValueType,
  LatexFontEncodingNormalValue,
  LatexFontShapeValue,
  LatexFontSizeUnit,
  LatexFontWeight,
  LatexFontWidth,
} from "../types";

describe("parseDeclareFixedFont", () => {
  it("should throw an error if the command is not named DeclareFixedFont", () => {
    const command: CommandToken = {
      type: LatexTokenType.Command,
      literal: "\\DeclareTextFont",
      name: "DeclareTextFont",
      arguments: [],
    };
    expect(() => parseDeclareFixedFont(command)).toThrow();
  });

  it("should throw an error if the command does not have 6 arguments", () => {
    const command: CommandToken = {
      type: LatexTokenType.Command,
      literal: "\\DeclareFixedFont",
      name: "DeclareFixedFont",
      arguments: [],
    };
    expect(() => parseDeclareFixedFont(command)).toThrow();
  });

  it("should throw an error if the first argument is not a macro", () => {
    const command: CommandToken = {
      type: LatexTokenType.Command,
      literal: "\\DeclareFixedFont",
      name: "DeclareFixedFont",
      arguments: [
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "name",
              originalLength: 4,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "OT1",
              originalLength: 3,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "cmr",
              originalLength: 3,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "m",
              originalLength: 1,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "n",
              originalLength: 1,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
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
      type: LatexTokenType.Command,
      literal: "\\DeclareFixedFont",
      name: "DeclareFixedFont",
      arguments: [
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Command,
              literal: "\\myfont",
              name: "myfont",
              arguments: [],
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "OT1",
              originalLength: 3,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "cmr",
              originalLength: 3,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "m",
              originalLength: 1,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
              literal: "n",
              originalLength: 1,
            },
          ],
        },
        {
          type: LatexCommandArgumentType.Required,
          content: [
            {
              type: LatexTokenType.Content,
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
          encoding: LatexFontEncodingNormalValue.KnuthTexText,
          type: 0,
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
          weight: LatexFontWeight.Medium,
          width: LatexFontWidth.Medium,
        },
      },
      shape: {
        type: FontValueType.FontValue,
        value: LatexFontShapeValue.Normal,
      },
      size: {
        type: FontValueType.FontValue,
        value: {
          unit: LatexFontSizeUnit.Point,
          value: 5,
        },
      },
    });
  });
});
