import { describe, expect, it, test } from "bun:test";

import {
	FontEncodingNormalValue,
	FontEncodingType,
	type FontMeasurementValue,
	type FontSeriesValue,
	FontShapeValue,
	FontSizeUnit,
	FontWeight,
	FontWidth,
} from "./types";
import {
	parseFontEncoding,
	parseFontFamily,
	parseFontMeasurement,
	parseFontSeries,
	parseFontShape,
} from "./utils";

describe("parseFontEncoding", () => {
	test.each<[FontEncodingNormalValue, string]>([
		[FontEncodingNormalValue.KnuthTexText, "OT1"],
		[FontEncodingNormalValue.ExtendedText, "T1"],
		[FontEncodingNormalValue.MathItalic, "OML"],
		[FontEncodingNormalValue.MathLargeSymbols, "OMX"],
		[FontEncodingNormalValue.MathSymbols, "OMS"],
		[FontEncodingNormalValue.Unknown, "U"],
	])(
		"should return a normal encoding of %p for an input of %s",
		(want, input) => {
			const got = parseFontEncoding(input);
			expect(got.type).toEqual(FontEncodingType.Normal);
			expect(got.encoding).toEqual(want);
		},
	);

	it("should give a local encoding based on input if the first letter is L", () => {
		const got = parseFontEncoding("LT1");
		expect(got.type).toEqual(FontEncodingType.Local);
		expect(got.encoding).toEqual("LT1");
	});

	it("should throw for all other values", () => {
		expect(() => parseFontEncoding("unknown")).toThrow();
	});
});

describe("parseFontSeries", () => {
	test.each<[FontSeriesValue, string]>([
		[{ weight: FontWeight.Medium, width: FontWidth.Medium }, "m"],
		[{ weight: FontWeight.Medium, width: FontWidth.ExtraCondensed }, "ec"],
		[{ weight: FontWeight.SemiBold, width: FontWidth.UltraExpanded }, "sbux"],
		[{ weight: FontWeight.UltraLight, width: FontWidth.Medium }, "ul"],
		[{ weight: FontWeight.Light, width: FontWidth.Condensed }, "lc"],
	])("should return a series of %o for an input of %s", (want, input) => {
		const got = parseFontSeries(input);
		expect(got).toEqual(want);
	});

	it("should throw if neiter the weight nor the width are recognized", () => {
		expect(() => parseFontSeries("")).toThrow();
	});
});

describe("parseFontShape", () => {
	test.each<[FontShapeValue, string]>([
		[FontShapeValue.CapsAndSmallCaps, "sc"],
		[FontShapeValue.CapsAndSmallCapsItalics, "scit"],
		[FontShapeValue.CapsAndSmallCapsOblique, "scsl"],
		[FontShapeValue.Italic, "it"],
		[FontShapeValue.Normal, "n"],
		[FontShapeValue.Oblique, "sl"],
		[FontShapeValue.SpacedCapsAndSmallCaps, "ssc"],
		[FontShapeValue.Swash, "sw"],
		[FontShapeValue.UprightItalic, "ui"],
	])("should return a shape of %o for an input of %s", (want, input) => {
		const got = parseFontShape(input);
		expect(got).toEqual(want);
	});

	it("should throw an error if the shape is not recognized", () => {
		expect(() => parseFontShape("unknown")).toThrow();
	});
});

describe("parseFontMeasurement;", () => {
	test.each<[FontMeasurementValue, string]>([
		[{ value: 1, unit: FontSizeUnit.Point }, "1"],
		[{ value: 10, unit: FontSizeUnit.Point }, "10pt"],
		[{ value: 11.2, unit: FontSizeUnit.Cicero }, "11.2cc"],
		[{ value: 123.4, unit: FontSizeUnit.BigPoint }, "123.4bp"],
		[{ value: 123.4, unit: FontSizeUnit.Centimeter }, "123.4cm"],
		[{ value: 123.4, unit: FontSizeUnit.Millimeter }, "123.4mm"],
		[{ value: 123.4, unit: FontSizeUnit.DidotPoint }, "123.4dd"],
		[{ value: 123.4, unit: FontSizeUnit.Em }, "123.4em"],
		[{ value: 123.4, unit: FontSizeUnit.Ex }, "123.4ex"],
		[{ value: 123.4, unit: FontSizeUnit.Inch }, "123.4in"],
		[{ value: 123.4, unit: FontSizeUnit.Mu }, "123.4mu"],
		[{ value: 123.4, unit: FontSizeUnit.Pica }, "123.4pc"],
		[{ value: 123.4, unit: FontSizeUnit.Pixel }, "123.4px"],
		[{ value: 123.4, unit: FontSizeUnit.ScaledPoint }, "123.4sp"],
		[{ value: 123.4, unit: FontSizeUnit.ViewportHeight }, "123.4vh"],
		[{ value: 123.4, unit: FontSizeUnit.ViewportWidth }, "123.4vw"],
		[{ value: 123.4, unit: FontSizeUnit.ViewportMin }, "123.4vmin"],
		[{ value: 123.4, unit: FontSizeUnit.ViewportMax }, "123.4vmax"],
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

describe("parseFontFamily", () => {
	it("should throw if the font family is an empty string", () => {
		expect(() => parseFontFamily("")).toThrow();
	});

	it("should return the font family if it is not empty", () => {
		const got = parseFontFamily("ptm");
		expect(got).toEqual("ptm");
	});
});
