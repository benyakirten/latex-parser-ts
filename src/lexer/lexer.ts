import { NoCache } from "./cache";
import { clamp } from "../utils";
import {
  LatexTokenType,
  LatexCharType,
  MathPosition,
  LatexAccentType,
  LatexCommandArgumentType,
  type LatexToken,
  type LexerCache,
  type CommandToken,
  type ContentToken,
  type LabeledArgContent,
  type CommentToken,
  type PlaceholderToken,
  type MathToken,
  type AccentToken,
  type LatexArguments,
  type RequiredArgument,
  type OptionalArgument,
  type BlockToken,
} from "./types";
/**
 * A lexer that will read a latex file and return a series of tokens.
 * It acts similar to a cursor in Rust where it will keep track of the
 * current position. It has peek and seek methods to change the current position.
 *
 * If no cache is provided, it defaults to no caching.
 */
export class LatexLexer {
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

  private position: number = 0;
  private input: string;
  constructor(
    input: string,
    private cache: LexerCache = new NoCache(),
  ) {
    // Enforce unescaping if it has already been escaped.
    // This is useful for recursive LatexLexer instantiations because
    // when creating a macro, it might have the end of line like this:
    // \\\n, which will be escaped as \\n, which will should be removed.
    input = this.unescapeContent(input);
    input = this.escapeInput(input);
    this.input = input;
  }

  private escapeInput(input: string): string {
    // TODO: Replace this with a function.
    // Replace `\\\n` but not `\\\\\n`.
    input = input.replaceAll(/(?<!\\)\\\n\s*/g, "");
    for (const [escapedSequence, escapeSequence] of Object.entries(
      LatexLexer.REPLACE_ESCAPE_CHARACTER_MAP,
    )) {
      input = input.replaceAll(escapedSequence, escapeSequence);
    }

    return input;
  }

  private unescapeContent(input: string): string {
    for (const [escapedSequence, escapeSequence] of Object.entries(
      LatexLexer.REPLACE_ESCAPE_CHARACTER_MAP,
    )) {
      input = input.replaceAll(escapeSequence, escapedSequence[1]);
    }

    return input;
  }

  public seek(position: number) {
    if (position < 0) {
      position = this.input.length + position;
    }

    this.position = clamp(position, 0, this.input.length);
  }

  public insert(position: number, value: string): IterableIterator<LatexToken> {
    if (position < 0) {
      position = this.input.length + position;
    }

    position = clamp(position, 0, this.input.length);
    this.input = this.input.slice(0, position) + value + this.input.slice(position);

    const iter = new LatexLexer(value);
    this.cache.insert(position, [...iter]);

    if (this.position >= position) {
      this.position += value.length;
    }

    return iter;
  }

  public remove(start: number, end: number): LatexLexer {
    start = clamp(start, 0, this.input.length);
    end = clamp(end, 0, this.input.length);
    if (start > end) {
      [start, end] = [end, start];
    }

    if (start === end) {
      return this;
    }

    this.input = this.input.slice(0, start) + this.input.slice(end);
    this.cache.remove(start, end);

    if (this.position >= start) {
      this.position -= end - start;
    }

    return this;
  }

  private readUntil(position: number, stopFn: (char: string) => boolean): string {
    let char = this.readChar(position);
    let word: string = "";
    while (char && !stopFn(char)) {
      word += char;
      position++;
      char = this.readChar(position);
    }

    return word;
  }

  private buildContent(startPosition: number, firstChar: string = ""): ContentToken {
    const content =
      firstChar +
      this.readUntil(startPosition, (c) => {
        return (
          c === LatexCharType.Backslash ||
          c === LatexCharType.OpenBracket ||
          c === LatexCharType.CloseBracket ||
          c === LatexCharType.OpenParen ||
          c === LatexCharType.CloseParen ||
          c === LatexCharType.OpenBrace ||
          c === LatexCharType.CloseBrace ||
          c === LatexCharType.Percent ||
          c === LatexCharType.Dollar ||
          c === LatexCharType.Ampersand ||
          c === LatexCharType.Hash ||
          c === LatexCharType.Underscore ||
          c === LatexCharType.Caret
        );
      });

    return {
      type: LatexTokenType.Content,
      literal: this.unescapeContent(content),
      originalLength: content.length,
    };
  }

  private buildParagraphMath(
    startPosition: number,
    startMathCharacter: LatexCharType.OpenBracket | LatexCharType.OpenParen,
  ): MathToken {
    const endMathCharacter =
      startMathCharacter === LatexCharType.OpenBracket
        ? LatexCharType.CloseBracket
        : LatexCharType.CloseParen;

    let char = this.readChar(startPosition);
    let hasSeenBackslash = false;
    let content = "";

    while (true) {
      if (!char) {
        throw new Error("Expected math block to close");
      }

      if (hasSeenBackslash) {
        // If we've seen a backslash and are now seeing a closing bracket, we can break
        if (char === endMathCharacter) {
          break;
        }

        hasSeenBackslash = false;
        content += LatexCharType.Backslash;
      } else if (char === LatexCharType.Backslash) {
        hasSeenBackslash = true;
        continue;
      }

      content += char;

      startPosition++;
      char = this.readChar(startPosition);
    }

    const mathPosition =
      endMathCharacter === LatexCharType.CloseBracket ? MathPosition.Centered : MathPosition.Block;

    const lexer = new LatexLexer(content);
    return {
      type: LatexTokenType.Math,
      literal: `\\${startMathCharacter}${content}\\${endMathCharacter}`,
      content: lexer.readToEnd(),
      position: mathPosition,
    };
  }

  private buildAccent(
    position: number,
    accentChar: LatexCharType.Tilde | LatexCharType.Caret,
  ): AccentToken {
    let content: string;
    let literalItem: string;
    const char = this.readChar(position);
    if (!char) {
      throw new Error("Expected at least one letter to follow accent");
    }

    if (char === LatexCharType.OpenBrace) {
      content = this.getSectionWithPossibleNesting(position + 1, LatexCharType.CloseBrace);
      literalItem = `{${content}}`;
    } else {
      content = char;
      literalItem = char;
    }
    return {
      type: LatexTokenType.Accent,
      literal: `\\${accentChar}${literalItem}`,
      accent:
        accentChar === LatexCharType.Tilde ? LatexAccentType.Tilde : LatexAccentType.Circumflex,
      content,
    };
  }

  private getSectionWithPossibleNesting(
    startPosition: number,
    endCharacter: LatexCharType,
  ): string {
    let position = startPosition;
    let char = this.readChar(position);
    const stack: LatexCommandArgumentType[] = [];

    let arg = "";
    while (true) {
      if (!char) {
        break;
      }

      if (char === endCharacter && stack.length === 0) {
        break;
      }

      arg += char;
      position++;

      if (char === LatexCharType.OpenBrace) {
        stack.push(LatexCommandArgumentType.Required);
      } else if (char === LatexCharType.OpenBracket) {
        stack.push(LatexCommandArgumentType.Optional);
      } else if (char === LatexCharType.CloseBrace) {
        if (stack[stack.length - 1] !== LatexCommandArgumentType.Required) {
          throw new Error("Mismatched braces");
        }

        stack.pop();
      } else if (char === LatexCharType.CloseBracket) {
        if (stack[stack.length - 1] !== LatexCommandArgumentType.Optional) {
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

    const args: LatexArguments = [];
    let position = startPosition + name.length;

    while (true) {
      const char = this.readChar(position);
      if (!char || char === LatexCharType.Space || char === LatexCharType.Newline) {
        break;
      }

      if (char === LatexCharType.Comma) {
        position--;
        break;
      }

      if (char === LatexCharType.OpenBrace) {
        // getSectionWithPossibleNesting won't include the opening or closing braces
        const content = this.getSectionWithPossibleNesting(position + 1, LatexCharType.CloseBrace);
        const requiredArg = this.buildRequiredArg(content);

        args.push(requiredArg);
        position += content.length + 2;
        continue;
      } else if (char === LatexCharType.OpenBracket) {
        const content = this.getSectionWithPossibleNesting(
          position + 1,
          LatexCharType.CloseBracket,
        );
        const optionalArg = this.buildOptionalArg(content);

        args.push(optionalArg);
        position += content.length + 2;
        continue;
      }
      throw new Error(`Character ${char} not expected while parsing command argument`);
    }

    const literal = this.input.slice(startPosition, position + 1);
    return {
      type: LatexTokenType.Command,
      literal: `\\${literal}`,
      arguments: args,
    };
  }

  private buildCommand(
    startPosition: number,
  ): CommandToken | ContentToken | MathToken | AccentToken {
    const nextChar = this.readChar(startPosition);
    if (!nextChar) {
      throw new Error("Command never closed");
    }

    if (nextChar === LatexCharType.OpenBracket || nextChar === LatexCharType.OpenParen) {
      return this.buildParagraphMath(startPosition + 1, nextChar);
    }

    if (nextChar === LatexCharType.Tilde || nextChar === LatexCharType.Caret) {
      return this.buildAccent(startPosition + 1, nextChar);
    }

    return this.createCommandToken(startPosition);
  }

  private readChar(position: number): string | undefined {
    return this.input.at(position);
  }

  private assertOptionalArgTokenOption(lexer: LatexLexer): CommandToken | ContentToken {
    const tokens = lexer.readToEnd();
    if (tokens.length !== 1) {
      throw new Error("Required arguments must be a single token");
    }

    const [token] = tokens;

    if (token.type === LatexTokenType.Command || token.type === LatexTokenType.Content) {
      return token;
    }

    throw new Error("An optional argument must either a singular command or content token");
  }

  private buildRequiredArg(content: string): RequiredArgument {
    const lexer = new LatexLexer(content);

    return {
      type: LatexCommandArgumentType.Required,
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

    const lexer = new LatexLexer(v);
    const arg = this.assertOptionalArgTokenOption(lexer);
    return { key: k.trimStart(), value: [arg] };
  }

  private getOptionalArguments(tokens: LatexToken[]): OptionalArgument["content"] {
    // TODO: Refactor this - it's a mess right now
    if (tokens.length === 1) {
      const [token] = tokens;

      // A singular command - we have one LatexToken
      if (token.type === LatexTokenType.Command) {
        return token;
      }

      if (token.type === LatexTokenType.Content) {
        // We have all labeled arguments without commands
        if (token.literal.includes("=")) {
          const labeledArgs: LabeledArgContent[] = [];
          for (const kvPair of token.literal.split(",")) {
            const labeledArg = this.parseLabeledArgContent(kvPair);
            if (!labeledArg) {
              throw new Error("Optional arguments should be separated by an equals sign");
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
    let key: string = "";
    let value: LatexToken[] = [];
    for (const token of tokens) {
      // If we get a content section that starts with a comma
      // then we have
      if (token.type === LatexTokenType.Content && token.literal.startsWith(LatexCharType.Comma)) {
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
              throw new Error("Optional arguments should be separated by an equals sign");
            }
            labeledArgs.push(arg);
          }
        }

        continue;
      }

      if (key === "") {
        if (token.type !== LatexTokenType.Content) {
          throw new Error(`Expected to receive an alphanumeric key name, instead got ${token}`);
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
              throw new Error("Key-value pairs must be separated by an equals sign");
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
    const tokens = new LatexLexer(content).readToEnd();
    const args = this.getOptionalArguments(tokens);

    return {
      type: LatexCommandArgumentType.Optional,
      content: args,
    };
  }

  private buildBlock(startPosition: number): BlockToken {
    const content = this.getSectionWithPossibleNesting(startPosition, LatexCharType.CloseBrace);
    if (!content.endsWith(LatexCharType.CloseBrace)) {
      throw new Error("Block never closed");
    }

    const lexer = new LatexLexer(content);
    return {
      type: LatexTokenType.Block,
      literal: `{${content}}`,
      content: lexer.readToEnd(),
    };
  }

  private buildComment(startPosition: number): CommentToken {
    const content = this.readUntil(startPosition, (c) => c === LatexCharType.Newline);
    return {
      type: LatexTokenType.Comment,
      literal: `%${content}\n`,
      content,
    };
  }

  private buildPlaceholder(startPosition: number): PlaceholderToken {
    const content = this.readUntil(startPosition, (c) => {
      const isNotNumber = isNaN(parseInt(c));
      return isNotNumber;
    });

    const parsedContent = parseInt(content);
    if (isNaN(parsedContent)) {
      throw new Error("Placeholder (#) expects an argument position");
    }

    return {
      type: LatexTokenType.Placeholder,
      literal: `#${parsedContent}`,
      content: parsedContent,
    };
  }

  private buildInlineMath(startPosition: number): MathToken {
    const content = this.readUntil(startPosition, (c) => c === "$");
    const lexer = new LatexLexer(content);
    return {
      type: LatexTokenType.Math,
      literal: `$${content}$`,
      content: lexer.readToEnd(),
      position: MathPosition.Inline,
    };
  }

  public peek(advance: number = 0): LatexToken | null {
    const position = this.position + advance;
    const char = this.input.at(position);
    if (!char) {
      return null;
    }

    const cachedItem = this.cache.get(this.position);
    if (cachedItem) {
      return cachedItem;
    }

    let token: LatexToken;
    switch (char) {
      case LatexCharType.CloseBrace:
      case LatexCharType.CloseBracket:
        throw new Error(`Could not detect opening character matching ${char}`);
      case LatexCharType.OpenBrace:
        token = this.buildBlock(position + 1);
        break;
      case LatexCharType.Backslash:
        token = this.buildCommand(position + 1);
        break;
      case LatexCharType.Caret:
        token = { type: LatexTokenType.Superscript, literal: char };
        break;
      case LatexCharType.Underscore:
        token = {
          type: LatexTokenType.Subscript,
          literal: char,
        };
        break;
      case LatexCharType.Ampersand:
        token = {
          type: LatexTokenType.ColumnAlign,
          literal: char,
        };
        break;
      case LatexCharType.Percent:
        token = this.buildComment(position + 1);
        break;
      case LatexCharType.Hash:
        token = this.buildPlaceholder(position + 1);
        break;
      case LatexCharType.Dollar:
        token = this.buildInlineMath(position + 1);
        break;
      default:
        token = this.buildContent(position);
        break;
    }

    this.cache.add(this.position, token);
    return token;
  }

  public nextToken(): LatexToken | null {
    const token = this.peek();
    if (!token) {
      return null;
    }

    if (token.type === LatexTokenType.Content) {
      this.position += token.originalLength;
    } else {
      this.position += token.literal.length;
    }

    return token;
  }

  public next(): IteratorResult<LatexToken> {
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
  public readToEnd(): LatexToken[] {
    this.seek(0);
    return [...this];
  }
}
