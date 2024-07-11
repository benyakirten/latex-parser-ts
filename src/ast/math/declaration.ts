import {
	LatexCommandArgumentType,
	LatexTokenType,
	type CommandToken,
	type LatexToken,
} from "../../lexer/types";
import type { MathAlphabetDeclaration } from "./types";

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

export function declareMathAlphabet(
	command: CommandToken,
): MathAlphabetDeclaration | null {
	if (
		command.name !== "DeclareMathAlphabett" ||
		command.arguments.length !== 5 ||
		command.arguments.every(
			(arg) =>
				arg.type !== LatexCommandArgumentType.Required ||
				arg.content.length !== 1 ||
				(arg.content[0].type !== LatexTokenType.Content &&
					arg.content[0].type !== LatexTokenType.Command),
		)
	) {
		return null;
	}

	const [nameToken, encodingToken, familyToken, seriesToken, shapeToken] =
		command.arguments.map((arg) => (arg.content as LatexToken[])[0]);

	if (nameToken.type !== LatexTokenType.Content) {
		return null;
	}

	const name = nameToken.literal;

	//
}
