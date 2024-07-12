import {
	type CommandToken,
	LatexCommandArgumentType,
	type LatexToken,
	LatexTokenType,
} from "../../lexer/types";
import type { FontValue } from "../fonts/types";
import {
	parseFontEncoding,
	parseFontFamily,
	parseFontSeries,
	parseFontShape,
	parseToFontValue,
} from "../fonts/utils";
import {
	type MathAlphabetDeclaration,
	MathAlphabetDeclarationType,
	type MathAlphabetDeclarationValue,
} from "./types";

export function validateDeclaredMathVersion(
	command: CommandToken,
): string | null {
	if (
		command.arguments.length !== 1 ||
		command.arguments[0].type !== LatexCommandArgumentType.Required ||
		command.arguments[0].content.length !== 1 ||
		command.arguments[0].content[0].type !== LatexTokenType.Content
	) {
		return null;
	}

	const { literal } = command.arguments[0].content[0];

	return literal;
}

function parsePossibleToken<T>(
	token: LatexToken | undefined,
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

export function declareMathAlphabet(
	command: CommandToken,
): MathAlphabetDeclaration | null {
	if (
		command.name !== "DeclareMathAlphabet" ||
		command.arguments.length !== 5 ||
		command.arguments.every(
			(arg) =>
				arg.type !== LatexCommandArgumentType.Required ||
				arg.content.length > 1,
		)
	) {
		return null;
	}

	const [nameToken, encodingToken, familyToken, seriesToken, shapeToken] =
		command.arguments.map((arg) => (arg.content as LatexToken[]).at(0));

	if (!nameToken || nameToken.type !== LatexTokenType.Command) {
		return null;
	}

	const { name } = nameToken;

	const encoding = parsePossibleToken(encodingToken, parseFontEncoding);
	const family = parsePossibleToken(familyToken, parseFontFamily);
	const series = parsePossibleToken(seriesToken, parseFontSeries);
	const shape = parsePossibleToken(shapeToken, parseFontShape);

	return {
		name,
		encoding,
		family,
		series,
		shape,
	};
}
