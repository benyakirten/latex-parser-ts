import {
	LatexCommandArgumentType,
	LatexTokenType,
	type CommandToken,
	type LatexArgument,
	type LatexToken,
	type RequiredArgument,
} from "../../lexer/types";
import { getRequiredContent, isSimpleMacro } from "../../lexer/utils";
import type { LatexFontMeasurementValue } from "../fonts/types";
import { parseFontMeasurement } from "../fonts/utils";
import { isSymbolFont } from "./selection";
import {
	MathSymbolType,
	MathSymbolValueType,
	type MathAccent,
	type MathDelimiter,
	type MathRadical,
	type MathSize,
	type MathSymbol,
	type MathSymbolValue,
	type SymbolFontWithSlot,
} from "./types";

export function getMathSymbolType(token?: LatexToken): MathSymbolType | null {
	let symbol: string;
	if (!token) {
		return null;
	}

	if (token.type === LatexTokenType.Content) {
		symbol = token.literal;
	} else if (token.type === LatexTokenType.Command && isSimpleMacro(token)) {
		symbol = token.name;
	} else {
		return null;
	}

	switch (symbol) {
		case "0":
		case "mathord":
			return MathSymbolType.Ordinary;
		case "1":
		case "mathop":
			return MathSymbolType.LargeOperator;
		case "2":
		case "mathbin":
			return MathSymbolType.BinaryOperator;
		case "3":
		case "mathrel":
			return MathSymbolType.Relation;
		case "4":
		case "mathopen":
			return MathSymbolType.Open;
		case "5":
		case "mathclose":
			return MathSymbolType.Close;
		case "6":
		case "mathpunct":
			return MathSymbolType.Punctuation;
		case "7":
		case "mathalpha":
			return MathSymbolType.AlphabetChar;
		default:
			return null;
	}
}

function getMathSymbolName(token?: LatexToken): MathSymbolValue | null {
	if (!token) {
		return null;
	}

	if (token.type === LatexTokenType.Command) {
		return {
			type: MathSymbolValueType.Command,
			value: token.name,
		};
	}

	if (token.type === LatexTokenType.Content) {
		const name = token.literal.trim();
		if (name.length !== 1) {
			return null;
		}

		return {
			type: MathSymbolValueType.Char,
			value: name,
		};
	}

	return null;
}

function validateSymbolFontWithSlot(
	symbolFontToken: LatexToken | undefined,
	slotToken: LatexToken | undefined,
	symbolFonts: string[],
): SymbolFontWithSlot | null {
	if (!symbolFontToken || symbolFontToken.type !== LatexTokenType.Content) {
		return null;
	}

	const symbolFont = symbolFontToken.literal;
	if (!(isSymbolFont(symbolFont) || symbolFonts.includes(symbolFont))) {
		return null;
	}

	if (!slotToken || slotToken.type !== LatexTokenType.Content) {
		return null;
	}

	const slot = slotToken.literal;

	return { symbolFont, slot };
}

function validateMathSymbol(
	command: CommandToken,
	commandName: string,
	symbolFonts: string[] = [],
): MathSymbol | null {
	if (
		command.name !== commandName ||
		command.arguments.length !== 4 ||
		command.arguments.some(
			(arg) =>
				arg.type !== LatexCommandArgumentType.Required ||
				arg.content.length !== 1,
		)
	) {
		return null;
	}

	const nameToken = (command.arguments[0] as RequiredArgument).content.at(0);
	const name = getMathSymbolName(nameToken);
	if (!name) {
		return null;
	}

	const typeToken = (command.arguments[1] as RequiredArgument).content.at(0);
	const type = getMathSymbolType(typeToken);
	if (!type) {
		return null;
	}

	const symbolFontToken = (command.arguments[2] as RequiredArgument).content.at(
		0,
	);
	const slotToken = (command.arguments[3] as RequiredArgument).content.at(0);

	const fontSlot = validateSymbolFontWithSlot(
		symbolFontToken,
		slotToken,
		symbolFonts,
	);
	if (!fontSlot) {
		return null;
	}

	return {
		symbol: name,
		type,
		fontSlot,
	};
}

export function declareMathSymbol(
	command: CommandToken,
	symbolFonts: string[] = [],
): MathSymbol | null {
	return validateMathSymbol(command, "DeclareMathSymbol", symbolFonts);
}

export function declareMathDelimiter(
	command: CommandToken,
	symbolFonts: string[] = [],
): MathDelimiter | null {
	if (
		command.name !== "DeclareMathDelimiter" ||
		command.arguments.length !== 6 ||
		command.arguments.some(
			(arg) =>
				arg.type !== LatexCommandArgumentType.Required ||
				arg.content.length !== 1,
		)
	) {
		return null;
	}

	const nameToken = (command.arguments[0] as RequiredArgument).content.at(0);
	const name = getMathSymbolName(nameToken);
	if (!name) {
		return null;
	}

	const typeToken = (command.arguments[1] as RequiredArgument).content.at(0);
	const type = getMathSymbolType(typeToken);
	if (!type) {
		return null;
	}

	const symbolFont1 = (command.arguments[2] as RequiredArgument).content.at(0);
	const slot1 = (command.arguments[3] as RequiredArgument).content.at(0);

	const fontSlot1 = validateSymbolFontWithSlot(symbolFont1, slot1, symbolFonts);

	if (!fontSlot1) {
		return null;
	}

	const symbolFont2 = (command.arguments[4] as RequiredArgument).content.at(0);
	const slot2 = (command.arguments[5] as RequiredArgument).content.at(0);

	const fontSlot2 = validateSymbolFontWithSlot(symbolFont2, slot2, symbolFonts);
	if (!fontSlot2) {
		return null;
	}

	return {
		symbol: name,
		type,
		fontSlot1,
		fontSlot2,
	};
}

export function declareMathAccent(
	command: CommandToken,
	symbolFonts: string[] = [],
): MathAccent | null {
	return validateMathSymbol(command, "DeclareMathAccent", symbolFonts);
}

export function declareMathRadical(
	command: CommandToken,
	symbolFonts: string[] = [],
): MathRadical | null {
	if (
		command.name !== "DeclareMathRadical" ||
		command.arguments.length !== 5 ||
		command.arguments.some(
			(arg) =>
				arg.type !== LatexCommandArgumentType.Required ||
				arg.content.length !== 1,
		)
	) {
		return null;
	}

	const nameToken = (command.arguments[0] as RequiredArgument).content.at(0);
	const name = getMathSymbolName(nameToken);
	if (!name) {
		return null;
	}

	const symbolFont1 = (command.arguments[1] as RequiredArgument).content.at(0);
	const slot1 = (command.arguments[2] as RequiredArgument).content.at(0);

	const fontSlot1 = validateSymbolFontWithSlot(symbolFont1, slot1, symbolFonts);
	if (!fontSlot1) {
		return null;
	}

	const symbolFont2 = (command.arguments[3] as RequiredArgument).content.at(0);
	const slot2 = (command.arguments[4] as RequiredArgument).content.at(0);

	const fontSlot2 = validateSymbolFontWithSlot(symbolFont2, slot2, symbolFonts);
	if (!fontSlot2) {
		return null;
	}

	return {
		symbol: name,
		fontSlot1,
		fontSlot2,
	};
}

function parseMeasurementFromArg(
	arg?: LatexArgument,
): LatexFontMeasurementValue | null {
	const currentSize = getRequiredContent(arg);
	if (!currentSize) {
		return null;
	}
	return parseFontMeasurement(currentSize);
}

export function declareMathSizes(command: CommandToken): MathSize | null {
	if (
		command.name !== "DeclareMathSizes" ||
		command.arguments.length !== 4 ||
		command.arguments.some(
			(arg) =>
				arg.type !== LatexCommandArgumentType.Required ||
				arg.content.length !== 1,
		)
	) {
		return null;
	}

	const currentSize = parseMeasurementFromArg(command.arguments.at(0));
	if (!currentSize) {
		return null;
	}

	const mainSize = parseMeasurementFromArg(command.arguments[1]);
	if (!mainSize) {
		return null;
	}

	const scriptSize = parseMeasurementFromArg(command.arguments[2]);
	if (!scriptSize) {
		return null;
	}

	const scriptScriptSize = parseMeasurementFromArg(command.arguments[3]);
	if (!scriptScriptSize) {
		return null;
	}

	return {
		mathTextSize: mainSize,
		currentTextSize: currentSize,
		scriptSize,
		scriptScriptSize,
	};
}
