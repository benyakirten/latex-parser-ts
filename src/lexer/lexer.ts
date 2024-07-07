import { NoCache } from "./cache";
import { clamp } from "../utils";
import {
  LatexTokenType,
  LatexCharType,
  MathPosition,
  LatexAccentType,
  LatexCommandArgumentType,
  ScriptTokenType,
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
  type ScriptToken,
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

  private buildContent(startPosition: number): ContentToken {
    const content = this.readUntil(startPosition, (c) => {
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
    startPosition: number,
    accentChar: LatexCharType.Tilde | LatexCharType.Caret,
  ): AccentToken {
    const token = this.buildModifiableToken(startPosition);
    return {
      type: LatexTokenType.Accent,
      literal: `\\${accentChar}${token.literal}`,
      detail:
        accentChar === LatexCharType.Tilde ? LatexAccentType.Tilde : LatexAccentType.Circumflex,
      content: token,
    };
  }

  private getSectionWithPossibleNesting(
    startPosition: number,
    endCharacter: LatexCharType,
    mustClose: boolean = false,
  ): string {
    let position = startPosition;
    let char = this.readChar(position);
    const stack: LatexCommandArgumentType[] = [];

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
        if (this.readChar(position - 1) !== LatexCharType.CloseBrace) {
          throw new Error("Required argument never closed");
        }
        continue;
      } else if (char === LatexCharType.OpenBracket) {
        const content = this.getSectionWithPossibleNesting(
          position + 1,
          LatexCharType.CloseBracket,
        );
        const optionalArg = this.buildOptionalArg(content);

        args.push(optionalArg);
        position += content.length + 2;

        if (this.readChar(position - 1) !== LatexCharType.CloseBracket) {
          throw new Error("Optional argument never closed");
        }
        continue;
      }

      throw new Error(`Character ${char} not expected while parsing command argument`);
    }

    let literal = this.input.slice(startPosition, position + 1);
    if (literal.endsWith(" ")) {
      literal = literal.slice(0, -1);
    }

    return {
      type: LatexTokenType.Command,
      literal: `\\${literal}`,
      arguments: args,
      name,
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

      if (
        token.type === LatexTokenType.Content &&
        token.literal.includes(LatexCharType.Comma) &&
        key !== ""
      ) {
        const [v] = token.literal.split(",");
        const vToken: ContentToken = {
          type: LatexTokenType.Content,
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
    const content = this.getSectionWithPossibleNesting(
      startPosition,
      LatexCharType.CloseBrace,
      true,
    );
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
    const content = this.readUntil(startPosition, (c) => isNaN(parseInt(c)));

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

  private buildModifiableToken(startPosition: number): ContentToken | BlockToken | CommandToken {
    const err = new Error(
      "Expected either open brace, backslash or alphanumeric character to follow character modifier",
    );
    const char = this.readChar(startPosition);

    if (!char) {
      throw err;
    }

    if (/\w/.test(char)) {
      return {
        type: LatexTokenType.Content,
        literal: char,
        originalLength: 1,
      };
    }

    if (char === LatexCharType.OpenBrace) {
      return this.buildBlock(startPosition + 1);
    }

    if (char === LatexCharType.Backslash) {
      const command = this.buildCommand(startPosition + 1);
      if (command.type !== LatexTokenType.Command) {
        throw err;
      }
      return command;
    }

    throw err;
  }

  private buildScript(
    startPosition: number,
    char: LatexCharType.Caret | LatexCharType.Underscore,
  ): ScriptToken {
    const token = this.buildModifiableToken(startPosition);
    return {
      type: LatexTokenType.Script,
      detail: char === LatexCharType.Caret ? ScriptTokenType.Super : ScriptTokenType.Sub,
      literal: `${char}${token.literal}`,
      content: token,
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
        token = this.buildScript(position + 1, char);
        break;
      case LatexCharType.Underscore:
        token = this.buildScript(position + 1, char);
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
