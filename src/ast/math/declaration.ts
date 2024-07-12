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
	type SetMathAlphabetDeclaration,
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
		// Allow SetMathAlphabet to reuse this functionality
		(command.name !== "DeclareMathAlphabet" &&
			command.name !== "SetMathAlphabet") ||
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

export function setMathAlphabet(
	command: CommandToken,
): SetMathAlphabetDeclaration | null {
	if (command.name !== "SetMathAlphabet" || command.arguments.length !== 6) {
		return null;
	}

	const versionToken = command.arguments[1];
	if (
		versionToken.type !== LatexCommandArgumentType.Required ||
		versionToken.content.length !== 1 ||
		versionToken.content[0].type !== LatexTokenType.Content
	) {
		return null;
	}

	const version = versionToken.content[0].literal;

	const newCommand = structuredClone(command);
	newCommand.arguments = newCommand.arguments.toSpliced(1, 1);

	const declaration = declareMathAlphabet(newCommand);

	if (!declaration) {
		return null;
	}

	return {
		...declaration,
		version,
	};
}
