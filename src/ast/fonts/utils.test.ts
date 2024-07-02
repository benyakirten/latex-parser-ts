import { expect, describe, test, it } from "bun:test";

import { parseFontEncoding, parseFontSeries, parseFontShape, parseFontMeasurement } from "./utils";
import type {
  LatexFontEncoding,
  LatexFontMeasurement,
  LatexFontSeries,
  LatexFontShape,
} from "./types";

describe.todo("parseFontEncoding", () => {
  test.each<[LatexFontEncoding, string]>([])(
    "should return a normal encoding of %p for an input of %s",
    (want, input) => {
      const got = parseFontEncoding(input);
      expect(got).toEqual(want);
    },
  );

  it("should give a local encoding based on input if the first letter is L", () => {
    // TODO
  });

  it("should throw for all other values", () => {
    // TODO
  });
});

describe.todo("parseFontSeries", () => {
  test.each<[LatexFontSeries, string]>([])(
    "should return a series of %o for an input of %s",
    (want, input) => {
      const got = parseFontSeries(input);
      expect(got).toEqual(want);
    },
  );

  it("should throw if the width is not recognized", () => {
    // TODO
  });

  it("should throw if the weight is not recognized", () => {
    // TODO
  });

  it("should throw if neiter the weight nor the width are recognized", () => {
    // TODO
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
