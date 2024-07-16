import {
	CommandArgumentType,
	type CommandToken,
	type RequiredArgument,
	TokenType,
} from "../../../lexer/types";
import {
	type AuthorCommand,
	AuthorCommandType,
	type AuthorDefaults,
	type FontMeasurementValue,
	FontSizeUnit,
	FontValueType,
} from "../types";
import {
	parseFontFamily,
	parseFontSeries,
	parseFontShape,
	parseToFontValue,
} from "../utils";

function createAuthorDefaultCommand(cmd: keyof AuthorDefaults): AuthorCommand {
	return {
		type: AuthorCommandType.AuthorDefault,
		value: cmd,
	};
}

function createAuthorSizeCommand(size: FontMeasurementValue): AuthorCommand {
	return {
		type: AuthorCommandType.FontSize,
		value: {
			type: FontValueType.FontValue,
			value: size,
		},
	};
}

export function parseAuthorCommand(
	authorCommand: string,
): AuthorCommand | null {
	// Source: https://www.latex-project.org/help/documentation/fntguide.pdf
	switch (authorCommand) {
		case "normalfont":
		case "textnormal":
			return createAuthorDefaultCommand("normal");
		case "textrm":
		case "rmfamily":
			return createAuthorDefaultCommand("serif");
		case "textsf":
		case "sffamily":
			return createAuthorDefaultCommand("sans");
		case "texttt":
		case "ttfamily":
			return createAuthorDefaultCommand("monospace");
		case "textmd":
		case "mdseries":
			return createAuthorDefaultCommand("medium");
		case "bfseries":
		case "textbf":
			return createAuthorDefaultCommand("bold");
		case "textit":
		case "itshape":
			return createAuthorDefaultCommand("italics");
		case "textsl":
		case "slshape":
			return createAuthorDefaultCommand("oblique");
		case "textsc":
		case "scshape":
			return createAuthorDefaultCommand("smallCaps");
		case "textssc":
		case "sscshape":
			return createAuthorDefaultCommand("spacedSmallCaps");
		case "textsw":
		case "swshape":
			return createAuthorDefaultCommand("swash");
		case "textulc":
		case "ulcshape":
			return createAuthorDefaultCommand("lowercase");
		case "textup":
		case "upshape":
			return createAuthorDefaultCommand("upcase");
		case "tiny":
			return createAuthorSizeCommand({
				value: 5,
				unit: FontSizeUnit.Point,
			});
		case "scriptsize":
			return createAuthorSizeCommand({
				value: 7,
				unit: FontSizeUnit.Point,
			});
		case "footnotesize":
			return createAuthorSizeCommand({
				value: 8,
				unit: FontSizeUnit.Point,
			});
		case "normalsize":
			return createAuthorSizeCommand({
				value: 10,
				unit: FontSizeUnit.Point,
			});
		case "large":
			return createAuthorSizeCommand({
				value: 12,
				unit: FontSizeUnit.Point,
			});
		case "Large":
			return createAuthorSizeCommand({
				value: 14.4,
				unit: FontSizeUnit.Point,
			});
		case "LARGE":
			return createAuthorSizeCommand({
				value: 17.28,
				unit: FontSizeUnit.Point,
			});
		case "huge":
			return createAuthorSizeCommand({
				value: 20.74,
				unit: FontSizeUnit.Point,
			});
		case "Huge":
			return createAuthorSizeCommand({
				value: 24.88,
				unit: FontSizeUnit.Point,
			});
		default:
			return null;
	}
}

function determineAuthorCommandKey(
	commandName: string,
): keyof AuthorDefaults | null {
	const namePieces = commandName.split("default");
	if (namePieces.length !== 2) {
		return null;
	}

	const name = namePieces[0].toLocaleLowerCase();

	switch (name) {
		case "rm":
			return "serif";
		case "sf":
			return "sans";
		case "tt":
			return "monospace";
		case "family":
			return "family";
		case "series":
			return "series";
		case "shape":
			return "shape";
		case "bf":
			return "bold";
		case "md":
			return "medium";
		case "it":
			return "italics";
		case "sl":
			return "oblique";
		case "sc":
			return "smallCaps";
		case "ssc":
			return "spacedSmallCaps";
		case "sw":
			return "swash";
		default:
			return null;
	}
}

export function setFontDefaults(
	renewCommand: CommandToken,
): Partial<AuthorDefaults> | null {
	if (renewCommand.name !== "renewcommand") {
		throw new Error(
			"Font defaults can only be set with the renewcommand command",
		);
	}
	const fontDefaults: Partial<AuthorDefaults> = {};
	if (
		renewCommand.arguments.length !== 2 ||
		renewCommand.arguments.every(
			(arg) => arg.type !== CommandArgumentType.Required,
		)
	) {
		throw new Error("Expected two required commands to follow renewcommand");
	}

	const [arg1, arg2] = renewCommand.arguments.map(
		(a) => a.content as RequiredArgument["content"],
	);

	if (arg1.length !== 1 || arg1[0].type !== TokenType.Command) {
		throw new Error("First required argument must be a command");
	}
	const [command] = arg1;

	if (command.name === "textnormal" || command.name === "normalfont") {
		throw new Error("Unimplemented");
	}

	const key = determineAuthorCommandKey(command.name);
	if (!key) {
		return null;
	}

	if (
		arg2.length !== 1 ||
		(arg2[0].type !== TokenType.Command && arg2[0].type !== TokenType.Content)
	) {
		throw new Error("Second required argument must be a command or argument");
	}

	const [content] = arg2;

	switch (key) {
		case "serif":
		case "monospace":
		case "sans":
		case "family":
			fontDefaults[key] = parseToFontValue(content, parseFontFamily);
			break;
		case "bold":
		case "medium":
		case "series":
			fontDefaults[key] = parseToFontValue(content, parseFontSeries);
			break;
		case "smallCaps":
		case "spacedSmallCaps":
		case "italics":
		case "oblique":
		case "shape":
		case "swash":
			fontDefaults[key] = parseToFontValue(content, parseFontShape);
			break;
	}

	return fontDefaults;
}
