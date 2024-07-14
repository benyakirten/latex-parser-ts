import {
	LatexCommandArgumentType,
	LatexTokenType,
	type CommandToken,
	type LatexArgument,
	type LatexToken,
	type SimpleMacro,
} from "./types";

/**
 * Checks if a given token is a command if that command is a simple macro.
 */
export function isSimpleMacro(token: LatexToken): token is SimpleMacro {
	return token.type === LatexTokenType.Command && token.arguments.length === 0;
}

/**
 * Verifies that an argument is required, has one content item and then returns the content.
 */
export function getRequiredContentItem(arg?: LatexArgument): LatexToken | null {
	if (
		!arg ||
		arg.type !== LatexCommandArgumentType.Required ||
		arg.content.length !== 1
	) {
		return null;
	}

	return arg.content.at(0) ?? null;
}

/**
 * Verifies that an argument is required and contains a simple macro and returns the macro.
 */
export function getRequiredSimpleMacro(
	arg?: LatexArgument,
): CommandToken | null {
	const token = getRequiredContentItem(arg);
	if (!token || !isSimpleMacro(token)) {
		return null;
	}

	return token;
}

/**
 * Verifies that an argument is required and contains content and returns the content's literal.
 */
export function getRequiredContent(arg?: LatexArgument): string | null {
	const token = getRequiredContentItem(arg);
	if (!token || token.type !== LatexTokenType.Content) {
		return null;
	}

	return token.literal;
}
