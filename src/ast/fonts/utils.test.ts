import { expect, describe, test, it } from "bun:test";

import { parseFontEncoding, parseFontSeries, parseFontShape, parseFontMeasurement } from "./utils";
import {
  LatexFontEncodingNormalValue,
  LatexFontEncodingType,
  LatexFontShape,
  LatexFontSizeUnit,
  LatexFontWeight,
  LatexFontWidth,
  type LatexFontMeasurement,
  type LatexFontSeries,
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

describe("parseFontShape", () => {
  test.each<[LatexFontShape, string]>([
    [LatexFontShape.CapsAndSmallCaps, "sc"],
    [LatexFontShape.CapsAndSmallCapsItalics, "scit"],
    [LatexFontShape.CapsAndSmallCapsOblique, "scsl"],
    [LatexFontShape.Italic, "it"],
    [LatexFontShape.Normal, "n"],
    [LatexFontShape.Oblique, "sl"],
    [LatexFontShape.SpacedCapsAndSmallCaps, "ssc"],
    [LatexFontShape.Swash, "sw"],
    [LatexFontShape.UprightItalic, "ui"],
  ])("should return a shape of %o for an input of %s", (want, input) => {
    const got = parseFontShape(input);
    expect(got).toEqual(want);
  });

  it("should throw an error if the shape is not recognized", () => {
    expect(() => parseFontShape("unknown")).toThrow();
  });
});

describe("parseFontMeasurement;", () => {
  test.each<[LatexFontMeasurement, string]>([
    [{ value: 1, unit: LatexFontSizeUnit.Point }, "1"],
    [{ value: 10, unit: LatexFontSizeUnit.Point }, "10pt"],
    [{ value: 11.2, unit: LatexFontSizeUnit.Cicero }, "11.2cc"],
    [{ value: 123.4, unit: LatexFontSizeUnit.BigPoint }, "123.4bp"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Centimeter }, "123.4cm"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Millimeter }, "123.4mm"],
    [{ value: 123.4, unit: LatexFontSizeUnit.DidotPoint }, "123.4dd"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Em }, "123.4em"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Ex }, "123.4ex"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Inch }, "123.4in"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Mu }, "123.4mu"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Pica }, "123.4pc"],
    [{ value: 123.4, unit: LatexFontSizeUnit.Pixel }, "123.4px"],
    [{ value: 123.4, unit: LatexFontSizeUnit.ScaledPoint }, "123.4sp"],
    [{ value: 123.4, unit: LatexFontSizeUnit.ViewportHeight }, "123.4vh"],
    [{ value: 123.4, unit: LatexFontSizeUnit.ViewportWidth }, "123.4vw"],
    [{ value: 123.4, unit: LatexFontSizeUnit.ViewportMin }, "123.4vmin"],
    [{ value: 123.4, unit: LatexFontSizeUnit.ViewportMax }, "123.4vmax"],
  ])("should return a measurement of %o for an input of %s", (want, input) => {
    const got = parseFontMeasurement(input);
    expect(got).toEqual(want);
  });

  it("should throw an error if the measurement is not recognized", () => {
    expect(() => parseFontMeasurement("unknown")).toThrow();
  });

  it("should throw an error if the unit is not recognized", () => {
    expect(() => parseFontMeasurement("1.2unknown")).toThrow();
  });
});
