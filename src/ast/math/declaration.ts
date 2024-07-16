import {
	CommandArgumentType,
	type CommandToken,
	type Token,
	TokenType,
} from "../../lexer/types";
import type { FontValue } from "../fonts/types";
import {
	parseFontEncoding,
	parseFontFamily,
	parseFontSeries,
	parseFontShape,
	parseToFontValue,
} from "../fonts/utils";
import { isMathSelection, isSymbolFont } from "./selection";
import {
	type MathAlphabetBase,
	type MathAlphabetDeclaration,
	MathAlphabetDeclarationType,
	type MathAlphabetDeclarationValue,
	type SetMathAlphabetDeclaration,
	type SymbolFontAlphabet,
} from "./types";

export function declareMathVersion(command: CommandToken): string | null {
	if (
		command.arguments.length !== 1 ||
		command.arguments[0].type !== CommandArgumentType.Required ||
		command.arguments[0].content.length !== 1 ||
		command.arguments[0].content[0].type !== TokenType.Content
	) {
		return null;
	}

	const { literal } = command.arguments[0].content[0];

	return literal;
}

function parsePossibleToken<T>(
	token: Token | undefined,
	callback: (token: string) => T,
): MathAlphabetDeclarationValue<FontValue<T>> {
	if (!token) {
		return {
			type: MathAlphabetDeclarationType.Reset,
		};
	}

	const value = parseToFontValue(token, callback);
	return {
		type: MathAlphabetDeclarationType.Set,
		value,
	};
}

function parseAlphabetDeclarationTokens(
	encodingToken: Token | undefined,
	familyToken: Token | undefined,
	seriesToken: Token | undefined,
	shapeToken: Token | undefined,
): MathAlphabetBase {
	const encoding = parsePossibleToken(encodingToken, parseFontEncoding);
	const family = parsePossibleToken(familyToken, parseFontFamily);
	const series = parsePossibleToken(seriesToken, parseFontSeries);
	const shape = parsePossibleToken(shapeToken, parseFontShape);

	return { encoding, family, series, shape };
}

export function declareMathOrSymbolAlphabet(
	command: CommandToken,
): MathAlphabetDeclaration | null {
	if (
		// Allow SetMathAlphabet to reuse this functionality
		(command.name !== "DeclareMathAlphabet" &&
			command.name !== "DeclareSymbolFont") ||
		command.arguments.length !== 5 ||
		command.arguments.every(
			(arg) =>
				arg.type !== CommandArgumentType.Required || arg.content.length > 1,
		)
	) {
		return null;
	}

	const [nameToken, encodingToken, familyToken, seriesToken, shapeToken] =
		command.arguments.map((arg) => (arg.content as Token[]).at(0));

	if (!nameToken || nameToken.type !== TokenType.Command) {
		return null;
	}

	const { name } = nameToken;

	return {
		name,
		...parseAlphabetDeclarationTokens(
			encodingToken,
			familyToken,
			seriesToken,
			shapeToken,
		),
	};
}

export function setMathOrSymbolFont(
	command: CommandToken,
): SetMathAlphabetDeclaration | null {
	if (
		(command.name !== "SetMathAlphabet" && command.name !== "SetSymbolFont") ||
		command.arguments.length !== 6 ||
		command.arguments.every((arg) => arg.type !== CommandArgumentType.Required)
	) {
		return null;
	}

	const [
		nameToken,
		versionToken,
		encodingToken,
		familyToken,
		seriesToken,
		shapeToken,
	] = command.arguments.map((arg) => (arg.content as Token[]).at(0));

	if (
		!nameToken ||
		nameToken.type !== TokenType.Command ||
		nameToken.arguments.length > 0
	) {
		return null;
	}

	const { name } = nameToken;

	if (!versionToken || versionToken.type !== TokenType.Content) {
		return null;
	}

	const version = versionToken.literal;

	return {
		version,
		name,
		...parseAlphabetDeclarationTokens(
			encodingToken,
			familyToken,
			seriesToken,
			shapeToken,
		),
	};
}

export function declareSymbolFontAlphabet(
	command: CommandToken,
	mathAlphabets: string[] = [],
	symbolFonts: string[] = [],
): SymbolFontAlphabet | null {
	if (
		command.name !== "DeclareSymbolFontAlphabet" ||
		command.arguments.length !== 2 ||
		command.arguments.every(
			(arg) =>
				arg.type !== CommandArgumentType.Required || arg.content.length > 1,
		)
	) {
		return null;
	}

	const [mathAlphabet, symbolFont] = command.arguments.map((arg) =>
		(arg.content as Token[]).at(0),
	);

	if (!mathAlphabet || mathAlphabet.type !== TokenType.Command) {
		return null;
	}

	const alphabetName = mathAlphabet.name;

	if (!symbolFont || symbolFont.type !== TokenType.Content) {
		return null;
	}

	const fontName = symbolFont.literal;

	if (
		!(isMathSelection(alphabetName) || mathAlphabets.includes(alphabetName))
	) {
		return null;
	}

	if (!(isSymbolFont(fontName) || symbolFonts.includes(fontName))) {
		return null;
	}

	return {
		mathAlphabet: alphabetName,
		symbolFont: fontName,
	};
}
