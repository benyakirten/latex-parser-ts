import {
	LatexCommandArgumentType,
	LatexTokenType,
	type CommandToken,
	type LatexToken,
	type OptionalArgument,
	type RequiredArgument,
	type SimpleMacro,
} from "./types";

export function isSimpleMacro(token: LatexToken): token is SimpleMacro {
	return token.type === LatexTokenType.Command && token.arguments.length === 0;
}

export function containsSimpleMacro(
	arg: RequiredArgument | OptionalArgument,
): CommandToken | null {
	if (
		arg.type !== LatexCommandArgumentType.Required ||
		arg.content.length !== 1
	) {
		return null;
	}

	const token = arg.content.at(0);
	if (token && isSimpleMacro(token)) {
		return token;
	}

	return null;
}
