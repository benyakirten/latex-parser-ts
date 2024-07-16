import {
	CommandArgumentType,
	type CommandToken,
	type Token,
	TokenType,
} from "../../../lexer/types";
import {
	type Font,
	type SelectionCommand,
	type SelectionCommandFontEncoding,
	type SelectionCommandFontFamily,
	type SelectionCommandFontLineSpread,
	type SelectionCommandFontSeries,
	type SelectionCommandFontShape,
	type SelectionCommandFontSize,
	SelectionCommandType,
} from "../types";
import {
	parseFontEncoding,
	parseFontFamily,
	parseFontMeasurement,
	parseFontSeries,
	parseFontShape,
	parseToFontValue,
} from "../utils";

function parseSelectionCommands(selectionCommands: SelectionCommand[]): Font {
	const Font: Font = {};
	for (const command of selectionCommands) {
		switch (command.type) {
			case SelectionCommandType.Encoding:
				Font.encoding = command.encoding;
				break;
			case SelectionCommandType.Family:
				Font.family = command.family;
				break;
			case SelectionCommandType.Series:
				Font.series = command.series;
				break;
			case SelectionCommandType.Shape:
				Font.shape = command.shape;
				break;
			case SelectionCommandType.Size:
				Font.size = command.size;
				Font.baselineSkip = command.baselineSkip;
				break;
			case SelectionCommandType.LineSpread:
				Font.lineSpread = command.value;
		}
	}

	return Font;
}

function testForOneRequiredArgument(token: CommandToken, type: string): Token {
	if (
		token.arguments.length !== 1 ||
		token.arguments[0].type !== CommandArgumentType.Required ||
		token.arguments[0].content.length !== 1
	) {
		throw new Error(
			`Font ${type} requires one required argument with one item inside`,
		);
	}

	return token.arguments[0].content[0];
}

function parseFontEncodingCommand(
	token: CommandToken,
): SelectionCommandFontEncoding {
	const encToken = testForOneRequiredArgument(token, "encoding");
	const encoding = parseToFontValue(encToken, parseFontEncoding);

	return {
		type: SelectionCommandType.Encoding,
		encoding,
	};
}

function parseFontFamilyCommand(
	token: CommandToken,
): SelectionCommandFontFamily {
	const familyToken = testForOneRequiredArgument(token, "family");
	const family = parseToFontValue(familyToken, parseFontFamily);
	return {
		type: SelectionCommandType.Family,
		family,
	};
}

function parseFontSeriesCommand(
	token: CommandToken,
): SelectionCommandFontSeries {
	const seriesToken = testForOneRequiredArgument(token, "series");
	const series = parseToFontValue(seriesToken, parseFontSeries);
	return {
		type: SelectionCommandType.Series,
		series,
	};
}

function parseFontShapeCommand(token: CommandToken): SelectionCommandFontShape {
	const shapesToken = testForOneRequiredArgument(token, "shape");
	const shape = parseToFontValue(shapesToken, parseFontShape);
	return {
		type: SelectionCommandType.Shape,
		shape,
	};
}

function parseFontSizeCommand(token: CommandToken): SelectionCommandFontSize {
	if (
		token.arguments.length !== 2 ||
		token.arguments.every((a) => a.type !== CommandArgumentType.Required)
	) {
		throw new Error(
			"Font size requires one required argument with two items inside",
		);
	}

	const [fontSizeArg, baselineSkipArg] = token.arguments;
	if (
		fontSizeArg.type !== CommandArgumentType.Required ||
		baselineSkipArg.type !== CommandArgumentType.Required
	) {
		throw new Error("");
	}

	const fontSizeToken = fontSizeArg.content[0];
	const baselineSkipToken = baselineSkipArg.content[0];

	const fontSize = parseToFontValue(fontSizeToken, parseFontMeasurement);
	const baselineSkip = parseToFontValue(
		baselineSkipToken,
		parseFontMeasurement,
	);

	return {
		type: SelectionCommandType.Size,
		size: fontSize,
		baselineSkip,
	};
}

function parseFontLinespreadCommand(
	token: CommandToken,
): SelectionCommandFontLineSpread {
	const linespreadToken = testForOneRequiredArgument(token, "linespread");
	const lineSpread = parseToFontValue(linespreadToken, Number.parseFloat);

	return {
		type: SelectionCommandType.LineSpread,
		value: lineSpread,
	};
}

export function parseSelectionCommandSection(
	token: CommandToken,
): SelectionCommand {
	switch (token.name.toLocaleLowerCase()) {
		case "fontencoding":
			return parseFontEncodingCommand(token);
		case "fontfamily":
			return parseFontFamilyCommand(token);
		case "fontseries":
			return parseFontSeriesCommand(token);
		case "fontshape":
			return parseFontShapeCommand(token);
		case "fontsize":
			return parseFontSizeCommand(token);
		case "linespread":
			return parseFontLinespreadCommand(token);
		default:
			throw new Error(`Unrecognized command: ${token.name}`);
	}
}

/** Expects the lexer to be at the backslash before the command name (e.g.. \fontsize) */
export function parseSelectionCommandSections(tokens: Token[]): Font {
	const selectionCommands: SelectionCommand[] = [];

	const selectFontToken = tokens.at(-1);
	if (
		!selectFontToken ||
		selectFontToken.type !== TokenType.Command ||
		selectFontToken.name !== "selectfont"
	) {
		throw new Error("Command selectfont must end a font selection sequence");
	}

	for (const token of tokens.slice(0, -1)) {
		if (token.type !== TokenType.Command) {
			continue;
		}

		const command = parseSelectionCommandSection(token);
		selectionCommands.push(command);
	}

	return parseSelectionCommands(selectionCommands);
}

/** Expects the lexer to be at the backslash before the command name (e.g.. \usefont) */
export function parseUseFont(token: Token): Font {
	if (
		token.type !== TokenType.Command ||
		token.name !== "usefont" ||
		token.arguments.length !== 4 ||
		!token.arguments.every((a) => a.type === CommandArgumentType.Required)
	) {
		throw new Error(
			"Command must be a valid usefont command to be parsed as usefont",
		);
	}

	const [encArg, familyArg, seriesArg, shapeArg] = token.arguments;
	for (const arg of [encArg, familyArg, seriesArg, shapeArg]) {
		if (arg.content.length !== 1) {
			throw new Error("Expected usefont arguments to only have one value");
		}
	}

	const encoding = parseToFontValue(encArg.content[0], parseFontEncoding);
	const family = parseToFontValue(familyArg.content[0], parseFontFamily);
	const series = parseToFontValue(seriesArg.content[0], parseFontSeries);
	const shape = parseToFontValue(shapeArg.content[0], parseFontShape);

	return { encoding, family, series, shape };
}
