import { clamp } from "../utils";
import { NoCache } from "./cache";
import {
	type AccentToken,
	type Arguments,
	type BlockRequiredAccent,
	type BlockToken,
	CharType,
	CommandArgumentType,
	type CommandToken,
	type CommentToken,
	type ContentToken,
	type LabeledArgContent,
	type LexerCache,
	MathPosition,
	type MathToken,
	type OptionalArgument,
	type PlaceholderToken,
	type RequiredArgument,
	type ScriptToken,
	ScriptTokenType,
	type Token,
	TokenType,
	type VariableAccent,
} from "./types";
/**
 * A lexer that will read a latex file and return a series of tokens.
 * It acts similar to a cursor in Rust where it will keep track of the
 * current position. It has peek and seek methods to change the current position.
 *
 * If no cache is provided, it defaults to no caching.
 */
export class Lexer {
	static readonly REPLACE_ESCAPE_CHARACTER_MAP = {
		// \ followed by a newline means continue as if the line didn't break
		"\\#": "@@<!HASH!>",
		"\\%": "@@<!PERCENT!>",
		"\\{": "@@<!LCURLY!>",
		"\\}": "@@<!RCURLY!>",
		"\\\\": "@@<!BACKSLASH!>",
		"\\&": "@@<!AMPERSAND!>",
		"\\$": "@@<!DOLLAR!>",
		"\\_": "@@<!UNDERSCORE!>",
		"\\^{}": "@@<!CARET!>",
		"\\~{}": "@@<!TILDE!>",
	};

	static readonly VARIABLE_ACCENT_CHARACTERS = new Set([
		"^",
		"~",
		"`",
		"'",
		'"',
		"=",
		".",
	]);

	static readonly BLOCK_REQUIRED_ACCENT_CHARACTERS = new Set([
		"H",
		"c",
		"b",
		"d",
		"u",
		"v",
		"t",
	]);

	private position = 0;
	private input: string;
	constructor(
		input: string,
		private cache: LexerCache = new NoCache(),
	) {
		this.input = this.escapeInput(input);
	}

	private escapeInput(input: string): string {
		let escapedInput = input;
		for (const [escapedSequence, escapeSequence] of Object.entries(
			Lexer.REPLACE_ESCAPE_CHARACTER_MAP,
		)) {
			escapedInput = escapedInput.replaceAll(escapedSequence, escapeSequence);
		}
		escapedInput = escapedInput.replaceAll(/\\\n\s*/g, "");

		return escapedInput;
	}

	private unescapeContent(input: string): string {
		let unescapedInput = input;
		for (const [escapedSequence, escapeSequence] of Object.entries(
			Lexer.REPLACE_ESCAPE_CHARACTER_MAP,
		)) {
			unescapedInput = unescapedInput.replaceAll(
				escapeSequence,
				escapedSequence[1],
			);
		}

		return unescapedInput;
	}

	private deescapeContent(input: string): string {
		let deescapedInput = input;
		for (const [escapedSequence, escapeSequence] of Object.entries(
			Lexer.REPLACE_ESCAPE_CHARACTER_MAP,
		)) {
			deescapedInput = deescapedInput.replaceAll(
				escapeSequence,
				escapedSequence,
			);
		}

		return deescapedInput;
	}

	public seek(position: number) {
		let pos = position;
		if (pos < 0) {
			pos = this.input.length + pos;
		}

		this.position = clamp(pos, 0, this.input.length);
	}

	public insert(position: number, value: string): Lexer {
		let pos = position;
		if (pos < 0) {
			pos = this.input.length + pos;
		}

		pos = clamp(pos, 0, this.input.length);

		this.input =
			this.input.slice(0, pos) +
			this.escapeInput(value) +
			this.input.slice(pos);

		if (this.position > 0 && this.position >= pos) {
			this.position += value.length;
		}

		return this;
	}

	public remove(start: number, end: number): Lexer {
		let removeStart = start;
		let removeEnd = end;

		removeStart = clamp(removeStart, 0, this.input.length);
		removeEnd = clamp(removeEnd, 0, this.input.length);
		if (removeStart > removeEnd) {
			[removeStart, removeEnd] = [removeEnd, removeStart];
		}

		if (removeStart === removeEnd) {
			return this;
		}

		this.input = this.input.slice(0, removeStart) + this.input.slice(removeEnd);
		this.cache.remove(removeStart, removeEnd);

		if (this.position >= removeStart) {
			this.position -= removeEnd - removeStart;
		}

		return this;
	}

	private readUntil(
		position: number,
		stopFn: (char: string) => boolean,
	): string {
		let pos = position;
		let char = this.readChar(pos);
		let word = "";
		while (char && !stopFn(char)) {
			word += char;
			pos++;
			char = this.readChar(pos);
		}

		return word;
	}

	private buildContent(startPosition: number): ContentToken {
		const content = this.readUntil(startPosition, (c) => {
			return (
				c === CharType.Backslash ||
				c === CharType.OpenBrace ||
				c === CharType.CloseBrace ||
				c === CharType.Percent ||
				c === CharType.Dollar ||
				c === CharType.Ampersand ||
				c === CharType.Hash ||
				c === CharType.Underscore ||
				c === CharType.Caret
			);
		});

		return {
			type: TokenType.Content,
			literal: this.unescapeContent(content),
			originalLength: content.length,
		};
	}

	private buildParagraphMath(
		startPosition: number,
		startMathCharacter: CharType.OpenBracket | CharType.OpenParen,
	): MathToken {
		const endMathCharacter =
			startMathCharacter === CharType.OpenBracket
				? CharType.CloseBracket
				: CharType.CloseParen;

		const endIndex = this.input.indexOf(`\\${endMathCharacter}`);
		if (endIndex === -1) {
			throw new Error("Expected math block to close");
		}

		const content = this.input.slice(startPosition, endIndex);
		const mathPosition =
			endMathCharacter === CharType.CloseBracket
				? MathPosition.Centered
				: MathPosition.Block;

		const lexer = new Lexer(content);

		return {
			type: TokenType.Math,
			literal: `\\${startMathCharacter}${content}\\${endMathCharacter}`,
			content: lexer.readToEnd(),
			position: mathPosition,
		};
	}

	private buildVariableAccent(
		startPosition: number,
		accentChar: VariableAccent,
	): AccentToken {
		const token = this.buildModifiableToken(startPosition);
		return {
			type: TokenType.Accent,
			literal: `\\${accentChar}${token.literal}`,
			detail: accentChar,
			content: token,
		};
	}

	private getSectionWithPossibleNesting(
		startPosition: number,
		endCharacter: CharType,
		mustClose = false,
	): string {
		let position = startPosition;
		let char = this.readChar(position);
		const stack: CommandArgumentType[] = [];

		let arg = "";
		while (true) {
			if (!char) {
				if (!mustClose && stack.length === 0) {
					break;
				}

				throw new Error(
					`Section with possible nesting never terminated correctly. ${stack} braces still remain.`,
				);
			}

			if (char === endCharacter && stack.length === 0) {
				break;
			}

			arg += char;
			position++;

			if (char === CharType.OpenBrace) {
				stack.push(CommandArgumentType.Required);
			} else if (char === CharType.OpenBracket) {
				stack.push(CommandArgumentType.Optional);
			} else if (char === CharType.CloseBrace) {
				if (stack[stack.length - 1] !== CommandArgumentType.Required) {
					throw new Error("Mismatched braces");
				}

				stack.pop();
			} else if (char === CharType.CloseBracket) {
				if (stack[stack.length - 1] !== CommandArgumentType.Optional) {
					throw new Error("Mismatched braces");
				}

				stack.pop();
			}

			char = this.readChar(position);
		}

		return arg;
	}

	// We are absolutely sure a command token should follow.
	private createCommandToken(startPosition: number): CommandToken {
		// Command names can only be made of alphanumeric characters.
		const name = this.readUntil(startPosition, (c) => !/\w/.test(c));
		if (!name) {
			throw new Error("Command never closed");
		}

		const args: Arguments = [];
		let position = startPosition + name.length;

		while (true) {
			const char = this.readChar(position);

			if (char === CharType.OpenBrace) {
				// getSectionWithPossibleNesting won't include the opening or closing braces
				const content = this.getSectionWithPossibleNesting(
					position + 1,
					CharType.CloseBrace,
				);
				const requiredArg = this.buildRequiredArg(content);

				args.push(requiredArg);
				position += content.length + 2;
				if (this.readChar(position - 1) !== CharType.CloseBrace) {
					throw new Error("Required argument never closed");
				}
				continue;
			}

			if (char === CharType.OpenBracket) {
				const content = this.getSectionWithPossibleNesting(
					position + 1,
					CharType.CloseBracket,
				);
				const optionalArg = this.buildOptionalArg(content);

				args.push(optionalArg);
				position += content.length + 2;

				if (this.readChar(position - 1) !== CharType.CloseBracket) {
					throw new Error("Optional argument never closed");
				}
				continue;
			}

			break;
		}

		const literal = this.input.slice(startPosition, position);

		return {
			type: TokenType.Command,
			literal: `\\${literal}`,
			arguments: args,
			name,
		};
	}

	private isBracesRequiredAccent(
		nextChar: string,
		charAfter: string | undefined,
	): nextChar is BlockRequiredAccent {
		if (charAfter !== CharType.OpenBrace) {
			return false;
		}

		return Lexer.BLOCK_REQUIRED_ACCENT_CHARACTERS.has(nextChar);
	}

	private isVariableAccent(nextChar: string): nextChar is VariableAccent {
		return Lexer.VARIABLE_ACCENT_CHARACTERS.has(nextChar);
	}

	private buildBracketRequiredAccent(
		startPosition: number,
		accentChar: BlockRequiredAccent,
	): AccentToken {
		const token = this.buildBlock(startPosition + 1);
		return {
			type: TokenType.Accent,
			literal: `\\${accentChar}${token.literal}`,
			detail: accentChar,
			content: token,
		};
	}

	private buildCommand(
		startPosition: number,
	): CommandToken | ContentToken | MathToken | AccentToken {
		const nextChar = this.readChar(startPosition);
		if (!nextChar) {
			throw new Error("Command never closed");
		}

		if (nextChar === CharType.OpenBracket || nextChar === CharType.OpenParen) {
			return this.buildParagraphMath(startPosition + 1, nextChar);
		}

		if (this.isVariableAccent(nextChar)) {
			return this.buildVariableAccent(startPosition + 1, nextChar);
		}

		if (
			this.isBracesRequiredAccent(nextChar, this.readChar(startPosition + 1))
		) {
			return this.buildBracketRequiredAccent(startPosition + 1, nextChar);
		}

		return this.createCommandToken(startPosition);
	}

	private readChar(position: number): string | undefined {
		return this.input.at(position);
	}

	private assertOptionalArgTokenOption(
		lexer: Lexer,
	): CommandToken | ContentToken {
		const tokens = lexer.readToEnd();
		if (tokens.length !== 1) {
			throw new Error("Required arguments must be a single token");
		}

		const [token] = tokens;

		if (token.type === TokenType.Command || token.type === TokenType.Content) {
			return token;
		}

		throw new Error(
			"An optional argument must either a singular command or content token",
		);
	}

	private buildRequiredArg(content: string): RequiredArgument {
		const lexer = new Lexer(content);

		return {
			type: CommandArgumentType.Required,
			content: lexer.readToEnd(),
		};
	}

	private parseLabeledArgContent(kvPair: string): LabeledArgContent | null {
		// Everything up to the equal signs is the key and everything else is the value.
		// Since we've split on commas
		const kv = kvPair.split("=");
		// If it ends with = then it will split into two items,
		// but the second will have 0 length. That indicates a failure
		// for this since a value should have some length to it.
		if (kv.length !== 2 || kv[1].length === 0) {
			return null;
		}

		const [k, v] = kv;

		const lexer = new Lexer(v);
		const arg = this.assertOptionalArgTokenOption(lexer);
		return { key: k.trimStart(), value: [arg] };
	}

	private getOptionalArguments(tokens: Token[]): OptionalArgument["content"] {
		// TODO: Refactor this - it's a mess right now
		if (tokens.length === 1) {
			const [token] = tokens;

			// A singular command - we have one Token
			if (token.type === TokenType.Command) {
				return token;
			}

			if (token.type === TokenType.Content) {
				// We have all labeled arguments without commands
				if (token.literal.includes("=")) {
					const labeledArgs: LabeledArgContent[] = [];
					for (const kvPair of token.literal.split(",")) {
						const labeledArg = this.parseLabeledArgContent(kvPair);
						if (!labeledArg) {
							throw new Error(
								"Optional arguments should be separated by an equals sign",
							);
						}

						labeledArgs.push(labeledArg);
					}

					return labeledArgs;
				}

				return token;
			}

			throw new Error(`Unable optional argument singular token: ${token}`);
		}

		// We want to be able to parse any sort of complexity, such as:
		// \\command3[a=b,b=\\arg1{%\nCool Th_in^g: #1}[a=^7,b=c,d=e],c=d]
		const labeledArgs: LabeledArgContent[] = [];
		let key = "";
		let value: Token[] = [];
		for (const token of tokens) {
			// If we get a content section that starts with a comma
			// then we have
			if (
				token.type === TokenType.Content &&
				token.literal.startsWith(CharType.Comma)
			) {
				const arg: LabeledArgContent = { key, value };
				labeledArgs.push(arg);

				key = "";
				value = [];

				const sections = token.literal.slice(1).split(",");
				for (const section of sections) {
					if (section.endsWith("=")) {
						key = section.slice(0, -1);
						value = [];
					} else {
						const arg = this.parseLabeledArgContent(section);
						if (!arg) {
							throw new Error(
								"Optional arguments should be separated by an equals sign",
							);
						}
						labeledArgs.push(arg);
					}
				}

				continue;
			}

			if (
				token.type === TokenType.Content &&
				token.literal.includes(CharType.Comma) &&
				key !== ""
			) {
				const [v] = token.literal.split(",");
				const vToken: ContentToken = {
					type: TokenType.Content,
					literal: v,
					originalLength: v.length,
				};

				value.push(vToken);

				const arg: LabeledArgContent = { key, value };
				labeledArgs.push(arg);

				key = "";
				value = [];

				token.literal = token.literal.slice(v.length);
			}

			if (key === "") {
				if (token.type !== TokenType.Content) {
					throw new Error(
						`Expected to receive an alphanumeric key name, instead got ${token}`,
					);
				}
				const literal = token.literal;

				const sections = literal.split(",");
				for (const section of sections) {
					if (!section) {
						continue;
					}

					const labeledArg = this.parseLabeledArgContent(section);
					if (labeledArg === null) {
						if (!section.endsWith("=")) {
							throw new Error(
								"Key-value pairs must be separated by an equals sign",
							);
						}
						key = section.slice(0, -1);
					} else {
						labeledArgs.push(labeledArg);
					}
				}
			} else {
				value.push(token);
			}
		}

		if (key && value.length > 0) {
			const arg: LabeledArgContent = { key, value };
			labeledArgs.push(arg);
		}

		return labeledArgs;
	}

	private buildOptionalArg(content: string): OptionalArgument {
		const tokens = new Lexer(content).readToEnd();
		const args = this.getOptionalArguments(tokens);

		return {
			type: CommandArgumentType.Optional,
			content: args,
		};
	}

	private buildBlock(startPosition: number): BlockToken {
		const content = this.getSectionWithPossibleNesting(
			startPosition,
			CharType.CloseBrace,
			true,
		);
		const lexer = new Lexer(content);
		return {
			type: TokenType.Block,
			literal: `{${content}}`,
			content: lexer.readToEnd(),
		};
	}

	private buildComment(startPosition: number): CommentToken {
		const content = this.readUntil(
			startPosition,
			(c) => c === CharType.Newline,
		);
		let literal = content;
		if (this.readChar(startPosition + content.length)) {
			literal += "\n";
		}
		return {
			type: TokenType.Comment,
			literal: `%${literal}`,
			content: this.deescapeContent(content),
		};
	}

	private buildPlaceholder(startPosition: number): PlaceholderToken {
		const content = this.readUntil(startPosition, (c) =>
			Number.isNaN(Number.parseInt(c)),
		);

		const parsedContent = Number.parseInt(content);
		if (Number.isNaN(parsedContent)) {
			throw new Error("Placeholder (#) expects an argument position");
		}

		return {
			type: TokenType.Placeholder,
			literal: `#${parsedContent}`,
			content: parsedContent,
		};
	}

	private buildInlineMath(startPosition: number): MathToken {
		const content = this.readUntil(startPosition, (c) => c === "$");
		if (this.readChar(startPosition + content.length) !== "$") {
			throw new Error("Inline math block not closed");
		}
		const lexer = new Lexer(content);
		return {
			type: TokenType.Math,
			literal: `$${content}$`,
			content: lexer.readToEnd(),
			position: MathPosition.Inline,
		};
	}

	private buildModifiableToken(
		startPosition: number,
	): ContentToken | BlockToken | CommandToken {
		const err = new Error(
			"Expected either open brace, backslash or alphanumeric character to follow character modifier",
		);
		const char = this.readChar(startPosition);

		if (!char) {
			throw err;
		}

		if (/\w/.test(char)) {
			return {
				type: TokenType.Content,
				literal: char,
				originalLength: 1,
			};
		}

		if (char === CharType.OpenBrace) {
			return this.buildBlock(startPosition + 1);
		}

		if (char === CharType.Backslash) {
			const command = this.buildCommand(startPosition + 1);
			if (command.type !== TokenType.Command) {
				throw err;
			}
			return command;
		}

		throw err;
	}

	private buildScript(
		startPosition: number,
		char: CharType.Caret | CharType.Underscore,
	): ScriptToken {
		const token = this.buildModifiableToken(startPosition);
		return {
			type: TokenType.Script,
			detail:
				char === CharType.Caret ? ScriptTokenType.Super : ScriptTokenType.Sub,
			literal: `${char}${token.literal}`,
			content: token,
		};
	}

	public peek(advance = 0): Token | null {
		const position = this.position + advance;
		const char = this.input.at(position);
		if (!char) {
			return null;
		}

		const cachedItem = this.cache.get(this.position);
		if (cachedItem) {
			return cachedItem;
		}

		let token: Token;
		switch (char) {
			case CharType.CloseBrace:
			case CharType.CloseBracket:
				throw new Error(`Could not detect opening character matching ${char}`);
			case CharType.OpenBrace:
				token = this.buildBlock(position + 1);
				break;
			case CharType.Backslash:
				token = this.buildCommand(position + 1);
				break;
			case CharType.Caret:
				token = this.buildScript(position + 1, char);
				break;
			case CharType.Underscore:
				token = this.buildScript(position + 1, char);
				break;
			case CharType.Ampersand:
				token = {
					type: TokenType.ColumnAlign,
					literal: char,
				};
				break;
			case CharType.Percent:
				token = this.buildComment(position + 1);
				break;
			case CharType.Hash:
				token = this.buildPlaceholder(position + 1);
				break;
			case CharType.Dollar:
				token = this.buildInlineMath(position + 1);
				break;
			default:
				token = this.buildContent(position);
				break;
		}

		this.cache.add(this.position, token);
		return token;
	}

	public nextToken(): Token | null {
		const token = this.peek();
		if (!token) {
			return null;
		}

		if (token.type === TokenType.Content) {
			this.position += token.originalLength;
		} else {
			this.position += token.literal.length;
		}

		return token;
	}

	public next(): IteratorResult<Token> {
		const token = this.nextToken();
		if (!token) {
			return { done: true, value: token };
		}

		return { done: false, value: token };
	}

	[Symbol.iterator]() {
		return this;
	}

	/**
	 * Reads through the whole iterator from the beginning.
	 */
	public readToEnd(): Token[] {
		this.seek(0);
		return [...this];
	}
}
