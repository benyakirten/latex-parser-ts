export class Result<Item> {
	constructor(
		private item: Item | null,
		private readonly doc: string[],
		private errors: LatexError[] = [],
	) {}

	isOk() {
		return this.item !== null && this.errors.length === 0;
	}

	unwrap(): Item {
		if (!this.isOk() || this.item === null) {
			throw this.formatErrors();
		}

		return this.item;
	}

	private formatErrors(): Error {
		const errorMessage = this.errors
			.map((error) => this.formatError(error))
			.join("\n");
		return new Error(errorMessage);
	}

	private formatError(error: LatexError): string {
		let lineNo = 0;
		let lineStartPosition = 0;
		let erroredPositionDiscovered = false;

		for (let i = 0; i < this.doc.length; i++) {
			const line = this.doc[i];
			if (lineStartPosition + line.length >= error.position) {
				lineNo = i + 1;
				erroredPositionDiscovered = true;
				break;
			}

			lineStartPosition += line.length + 1;
		}

		if (!erroredPositionDiscovered) {
			return `Error at position ${error.position}: ${error.message}`;
		}

		const line = this.doc[lineNo - 1];
		const errorPosition = error.position - lineStartPosition;
		return `Error at line ${lineNo}, column:${errorPosition}: ${error.message}\n${line}\n${" ".repeat(errorPosition)}^\n`;
	}

	context(err: LatexError | (() => LatexError)): Result<Item> {
		if (this.isOk()) {
			return this;
		}

		const newErrs = this.errors.concat(typeof err === "function" ? err() : err);
		return new Result(null, this.doc, newErrs) as Result<Item>;
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

export class LatexError extends Error {
	constructor(
		message: string,
		public position: number,
	) {
		super(message);
	}
}
