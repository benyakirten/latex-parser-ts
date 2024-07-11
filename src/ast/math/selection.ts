import type { CommandToken } from "../../lexer/types";
import { MathFont } from "./types";

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

export function isMathVersion(
	command: CommandToken,
	declaredVersions: string[],
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
	if (
		version === "bold" ||
		version === "normal" ||
		declaredVersions.includes(version)
	) {
		return true;
	}

	return false;
}
