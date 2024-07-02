import { expect, describe, test, it } from "bun:test";

import { parseFontEncoding, parseFontSeries, parseFontShape, parseFontMeasurement } from "./utils";
import {
  LatexFontEncodingNormalValue,
  LatexFontEncodingType,
  LatexFontWeight,
  LatexFontWidth,
  type LatexFontMeasurement,
  type LatexFontSeries,
  type LatexFontShape,
} from "./types";

describe("parseFontEncoding", () => {
  test.each<[LatexFontEncodingNormalValue, string]>([
    [LatexFontEncodingNormalValue.KnuthTexText, "OT1"],
    [LatexFontEncodingNormalValue.ExtendedText, "T1"],
    [LatexFontEncodingNormalValue.MathItalic, "OML"],
    [LatexFontEncodingNormalValue.MathLargeSymbols, "OMX"],
    [LatexFontEncodingNormalValue.MathSymbols, "OMS"],
    [LatexFontEncodingNormalValue.Unknown, "U"],
  ])("should return a normal encoding of %p for an input of %s", (want, input) => {
    const got = parseFontEncoding(input);
    expect(got.type).toEqual(LatexFontEncodingType.Normal);
    expect(got.encoding).toEqual(want);
  });

  it("should give a local encoding based on input if the first letter is L", () => {
    const got = parseFontEncoding("LT1");
    expect(got.type).toEqual(LatexFontEncodingType.Local);
    expect(got.encoding).toEqual("LT1");
  });

  it("should throw for all other values", () => {
    expect(() => parseFontEncoding("unknown")).toThrow();
  });
});

describe("parseFontSeries", () => {
  test.each<[LatexFontSeries, string]>([
    [{ weight: LatexFontWeight.Medium, width: LatexFontWidth.Medium }, "m"],
    [{ weight: LatexFontWeight.Medium, width: LatexFontWidth.ExtraCondensed }, "ec"],
    [{ weight: LatexFontWeight.SemiBold, width: LatexFontWidth.UltraExpanded }, "sbux"],
    [{ weight: LatexFontWeight.UltraLight, width: LatexFontWidth.Medium }, "ul"],
    [{ weight: LatexFontWeight.Light, width: LatexFontWidth.Condensed }, "lc"],
  ])("should return a series of %o for an input of %s", (want, input) => {
    const got = parseFontSeries(input);
    expect(got).toEqual(want);
  });

  it("should throw if neiter the weight nor the width are recognized", () => {
    expect(() => parseFontSeries("")).toThrow();
  });
});

describe.todo("parseFontShape", () => {
  test.each<[LatexFontShape, string]>([])(
    "should return a shape of %o for an input of %s",
    (want, input) => {
      const got = parseFontShape(input);
      expect(got).toEqual(want);
    },
  );

  it("should throw an error if the shape is not recognized", () => {
    // TODO
  });
});

describe.todo("parseFontMeasurement;", () => {
  test.each<[LatexFontMeasurement, string]>([])(
    "should return a measurement of %o for an input of %s",
    (want, input) => {
      const got = parseFontMeasurement(input);
      expect(got).toEqual(want);
    },
  );

  it("should throw an error if the measurement is not recognized", () => {
    // TODO
  });

  it("should throw an error if the unit is not recognized", () => {
    // TODO
  });
});
