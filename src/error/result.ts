/**
 * An result wrapper that allows easy building of stack traces and error handling
 */
export class Result<Item> {
	constructor(
		private readonly item: Item | null,
		private readonly doc: string[],
		private readonly errors: LatexError[] = [],
	) {}

	isOk() {
		return this.item !== null && this.errors.length === 0;
	}

	isErr() {
		return !this.isOk();
	}

	unwrap(): Item {
		if (!this.isOk() || this.item === null) {
			throw this.formatErrors();
		}

		return this.item;
	}

	describe(): Error | null {
		if (this.isOk()) {
			return null;
		}

		return this.formatErrors();
	}

	private formatErrors(): Error {
		if (this.errors.length === 0) {
			return new Error("No item to return");
		}
		const errorMessage = this.errors
			.map((error) => this.formatError(error))
			.join("\n");
		return new Error(`\n${errorMessage}`);
	}

	private formatError(error: LatexError): string {
		let lineNum = 0;
		let lineStartPosition = 0;

		for (let i = 0; i < this.doc.length; i++) {
			const line = this.doc[i];
			if (lineStartPosition + line.length >= error.position) {
				lineNum = i;
				break;
			}

			lineStartPosition += line.length;
		}

		const line = this.doc[lineNum];
		if (error.position > lineStartPosition + line.length) {
			return `Error at position ${error.position}: ${error.message}`;
		}
		const colNum = error.position - lineStartPosition;
		return `Error at line ${lineNum + 1}, column ${colNum} ${error.fnName ? `in ${error.fnName}` : ""}:\n${error.message}\n${line}\n${" ".repeat(colNum)}^`;
	}

	context(err: LatexError | (() => LatexError)): Result<Item> {
		if (this.isOk()) {
			return this;
		}

		const newErrs = this.errors.concat(typeof err === "function" ? err() : err);
		return new Result<Item>(null, this.doc, newErrs);
	}

	map<NewType>(
		f: (item: Item) => NewType,
		err?: LatexError | (() => LatexError),
	): Result<NewType> {
		if (this.isOk()) {
			const item = this.unwrap();
			return new Result(f(item), this.doc, this.errors);
		}

		const newErrs = err
			? this.errors.concat(typeof err === "function" ? err() : err)
			: this.errors;

		return new Result(null, this.doc, newErrs) as Result<NewType>;
	}
}

export function Ok<Item>(item: Item, doc: string[]): Result<Item> {
	return new Result(item, doc, []);
}

export function Err<Item>(doc: string[], error: LatexError): Result<Item> {
	return new Result<Item>(null, doc, [error]);
}

export class LatexError extends Error {
	constructor(
		message: string,
		public position: number,
		public fnName?: string,
	) {
		super(message);
	}
}
