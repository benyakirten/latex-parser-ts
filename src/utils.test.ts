import { it, expect, describe } from "bun:test";

import { clamp } from "./utils";

describe("clamp", () => {
  it("should return the minimum if the parameter is less than the minimum", () => {
    const got = clamp(-100, 0, 100);
    expect(got).toEqual(0);
  });

  it("should return the maximum if the parameter is greater than the maximum", () => {
    const got = clamp(10000, 0, 100);
    expect(got).toEqual(100);
  });

  it("should return the parameter if it is between the minimum and maximum", () => {
    const got = clamp(50, 0, 100);
    expect(got).toEqual(50);
  });
});
