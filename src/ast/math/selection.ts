import type { CommandToken } from "../../lexer/types";
import { MathFont, MathSymbolFont } from "./types";

export function isMathSelection(name: string): name is MathFont {
	switch (name) {
		case MathFont.Normal:
		case MathFont.Serif:
		case MathFont.BoldRoman:
		case MathFont.SansSerif:
		case MathFont.TextItalic:
		case MathFont.Typewriter:
		case MathFont.Calligraphic:
			return true;
		default:
			return false;
	}
}

export function isSymbolFont(name: string): name is MathSymbolFont {
	switch (name) {
		case MathSymbolFont.Operators:
		case MathSymbolFont.Letters:
		case MathSymbolFont.Symbols:
		case MathSymbolFont.LargeSymbols:
			return true;
		default:
			return false;
	}
}

export function isMathVersion(
	command: CommandToken,
	declaredVersions: string[] = [],
): boolean {
	if (command.arguments.length > 1) {
		return false;
	}

	if (command.arguments.length === 1 && command.name === "mathversion") {
		return true;
	}

	const mathVersion = command.name.split("math");
	if (mathVersion.length !== 2) {
		return false;
	}

	const [version] = mathVersion;
	return (
		version === "bold" ||
		version === "normal" ||
		declaredVersions.includes(version) ||
		declaredVersions.includes(command.name)
	);
}
