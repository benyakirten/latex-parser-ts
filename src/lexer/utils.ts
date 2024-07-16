import {
	type Argument,
	CommandArgumentType,
	type CommandToken,
	type SimpleMacro,
	type Token,
	TokenType,
} from "./types";

/**
 * Checks if a given token is a command if that command is a simple macro.
 */
export function isSimpleMacro(token: Token): token is SimpleMacro {
	return token.type === TokenType.Command && token.arguments.length === 0;
}

/**
 * Verifies that an argument is required, has one content item and then returns the content.
 */
export function getRequiredContentItem(arg?: Argument): Token | null {
	if (
		!arg ||
		arg.type !== CommandArgumentType.Required ||
		arg.content.length !== 1
	) {
		return null;
	}

	return arg.content.at(0) ?? null;
}

/**
 * Verifies that an argument is required and contains a simple macro and returns the macro.
 */
export function getRequiredSimpleMacro(arg?: Argument): CommandToken | null {
	const token = getRequiredContentItem(arg);
	if (!token || !isSimpleMacro(token)) {
		return null;
	}

	return token;
}

/**
 * Verifies that an argument is required and contains content and returns the content's literal.
 */
export function getRequiredContent(arg?: Argument): string | null {
	const token = getRequiredContentItem(arg);
	if (!token || token.type !== TokenType.Content) {
		return null;
	}

	return token.literal;
}
