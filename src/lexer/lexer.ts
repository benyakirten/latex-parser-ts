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
  type LatexArgument,
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
  static readonly REPLACE_ESCAPE_CHARACTERS_MAP = {
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
    this.input = this.escapeInput(input);
  }

  private escapeInput(input: string): string {
    input = input.replaceAll(/\\\n\s*/g, "");
    for (const [escapedSequence, escapeSequence] of Object.entries(
      LatexLexer.REPLACE_ESCAPE_CHARACTERS_MAP,
    )) {
      input = input.replaceAll(escapedSequence, escapeSequence);
    }

    return input;
  }

  private unescapeContent(input: string): string {
    for (const [escapedSequence, escapeSequence] of Object.entries(
      LatexLexer.REPLACE_ESCAPE_CHARACTERS_MAP,
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

    return this;
  }

  public readUntil(startPosition: number, stopFn: (char: string) => boolean): string {
    let char = this.readChar(startPosition);
    let word: string = "";

    while (char && stopFn(char)) {
      word += char;
      startPosition++;
      char = this.readChar(startPosition);
    }

    word = word.replaceAll("\\\n", "");

    return word;
  }

  private buildContent(startPosition: number, firstChar: string = ""): ContentToken {
    const content =
      firstChar +
      this.readUntil(startPosition, (c) => {
        if (
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
          c === LatexCharType.Caret ||
          c === LatexCharType.Newline ||
          c === LatexCharType.Space
        ) {
          return true;
        }
        return false;
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
      content: [...lexer],
      position: mathPosition,
    };
  }

  private buildAccent(accentChar: LatexCharType.Tilde | LatexCharType.Caret): AccentToken {
    return {
      type: LatexTokenType.Accent,
      literal: `\\${accentChar}`,
      accent:
        accentChar === LatexCharType.Tilde ? LatexAccentType.Tilde : LatexAccentType.Circumflex,
    };
  }

  private getArgumentToClose(startPosition: number, endCharacter: LatexCharType): string {
    let position = startPosition;
    let char = this.readChar(position);
    const stack: LatexCommandArgumentType[] = [];

    while (true) {
      if (!char) {
        throw new Error("Command never closed");
      }

      if (char === endCharacter && stack.length === 0) {
        break;
      }

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

      position++;
      char = this.readChar(position);
    }

    return this.input.slice(startPosition, position);
  }

  // We are absolutely sure a command token should follow.
  private createCommandToken(startPosition: number): CommandToken {
    // Command names can only be made of alphanumeric characters.
    const name = this.readUntil(startPosition, (c) => !/\w/.test(c));

    if (!name) {
      throw new Error("Command never closed");
    }

    const args: LatexArguments = [];
    // Since readUntil won't include the last character, we need to add + 1 to the position
    let position = (startPosition += name.length) + 1;

    while (true) {
      const char = this.readChar(position);
      if (!char) {
        break;
      }

      if (char === LatexCharType.OpenBrace) {
        const content = this.getArgumentToClose(position, LatexCharType.CloseBrace);
        args.push(this.buildRequiredArg(content));
        // getArgumentToCloe won't include the closing brace, so we need to add + 1
        position += content.length + 1;
        continue;
      } else if (char === LatexCharType.OpenBracket) {
        const content = this.getArgumentToClose(position, LatexCharType.CloseBracket);
        args.push(this.buildOptionalArg(content));
        position += content.length + 1;
        continue;
      }

      if (char === LatexCharType.Space || char === LatexCharType.Newline) {
        break;
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
      return this.buildAccent(nextChar);
    }

    return this.createCommandToken(startPosition);
  }

  private readChar(startPosition: number): string | undefined {
    const finalPosition = this.position + startPosition;

    return this.input.at(finalPosition);
  }

  private isLatexArgument(token: LatexToken): token is LatexArgument {
    return token.type === LatexTokenType.Command || token.type === LatexTokenType.Content;
  }

  private buildSingleArgument(lexer: LatexLexer): LatexArgument {
    const tokens = [...lexer];
    if (tokens.length !== 1) {
      throw new Error("Required arguments must be a single token");
    }

    const [token] = tokens;
    if (!this.isLatexArgument(token)) {
      throw new Error("Required arguments must be  coommand or content token");
    }

    return token;
  }

  private buildRequiredArg(content: string): RequiredArgument {
    const lexer = new LatexLexer(content);
    const arg = this.buildSingleArgument(lexer);

    return {
      type: LatexCommandArgumentType.Required,
      content: arg,
    };
  }

  private parseOptionalLabeledArgs(argPairs: string[]): LabeledArgContent[] {
    const labeledArgs: LabeledArgContent[] = [];
    for (const pair of argPairs) {
      const kv = pair.split("=");
      if (kv.length !== 2) {
        throw new Error(
          "When multiple optional arguments are provided, they all must be labeled and separated with commas",
        );
      }
      const [k, v] = kv;

      const lexer = new LatexLexer(v);
      const arg = this.buildSingleArgument(lexer);
      const labeledArg = { key: k.trimStart(), value: arg };
      labeledArgs.push(labeledArg);
    }

    return labeledArgs;
  }

  private buildOptionalArg(content: string): OptionalArgument {
    let args: OptionalArgument["content"];

    // We're not splitting on commas since we could have a comma in the content
    // Or, in the case of the xparse package and a custom macro, we could
    // have multiple arguments, but that comes from a possible package
    // that would have to be evaluated later.
    const items = content.split("=");

    // One unlabelled argument
    if (items.length == 1) {
      const lexer = new LatexLexer(items[0]);
      args = this.buildSingleArgument(lexer);
    } else {
      const pairs = content.split(",");
      args = this.parseOptionalLabeledArgs(pairs);
    }

    return {
      type: LatexCommandArgumentType.Optional,
      content: args,
    };
  }

  private buildBlock(startPosition: number): BlockToken {
    const content = this.getArgumentToClose(startPosition, LatexCharType.CloseBrace);
    if (!content.endsWith(LatexCharType.CloseBrace)) {
      throw new Error("Block never closed");
    }

    const lexer = new LatexLexer(content);
    return {
      type: LatexTokenType.Block,
      literal: `{${content}}`,
      content: [...lexer],
    };
  }

  private buildComment(startPosition: number): CommentToken {
    const content = this.readUntil(startPosition, (c) => c === LatexCharType.Newline);
    return {
      type: LatexTokenType.Comment,
      literal: `%${content}`,
    };
  }

  private buildPlaceholder(startPosition: number): PlaceholderToken {
    const content = this.readUntil(startPosition, (c) => {
      const isInt = isNaN(parseInt(c));
      return !isInt;
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
        token = {
          type: LatexTokenType.Superscript,
          literal: char,
        };
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
    this.position += token.literal.length;

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
}
