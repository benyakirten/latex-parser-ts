import { describe, expect, it } from "bun:test";
import { LatexError, Result } from "./result";

describe("result", () => {
	describe("context", () => {
		it("should add to the error stack if the result is not ok", () => {
			// TODO
		});
		it("should not add to the error stack if the result is ok", () => {
			// TODO
		});
	});
	describe("isOk", () => {
		it("should return if the item is null or there are any errors", () => {
			// TODO
		});
		it("should return true for isOk if the item is present and there are no errors", () => {
			// TODO
		});
	});
	describe("map", () => {
		it("should return a new Result with the item transformed if the item is ok", () => {
			// TODO
		});
		it("should return a new Result with the error stack and a new error if the error parameter is defined if the result is not ok", () => {
			// TODO
		});
		it("should return a new Result with the error stack if the error parameter is not defined if the result is not ok", () => {
			// TODO
		});
	});
	describe("unwrap", () => {
		it("should throw an error that contains a list of error positions in the document if the result is not ok", () => {
			// TODO
		});
		it("should return the item if the result is ok", () => {
			// TODO
		});
	});
});

describe("Ok", () => {
	it("should return a new Result with the item and doc", () => {
		// TODO
	});
});

describe("Err", () => {
	it("should return a new Result with an error stack", () => {
		// TODO
	});
});
