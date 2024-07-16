import { type Token, TokenType } from "../../lexer/types";
import {
	type FontEncodingLocal,
	FontEncodingNormalValue,
	FontEncodingType,
	type FontEncodingValue,
	type FontMeasurementValue,
	type FontSeriesValue,
	FontShapeValue,
	FontSizeUnit,
	type FontValue,
	FontValueType,
	FontWeight,
	FontWidth,
} from "./types";

export function parseFontEncoding(rawCommand: string): FontEncodingValue {
	if (rawCommand.toLocaleUpperCase().startsWith("L")) {
		const fontEncoding: FontEncodingLocal = {
			type: FontEncodingType.Local,
			encoding: rawCommand,
		};

		return fontEncoding;
	}

	let encoding: FontEncodingNormalValue;

	switch (rawCommand.toLocaleUpperCase()) {
		case "OT1":
			encoding = FontEncodingNormalValue.KnuthTexText;
			break;
		case "T1":
			encoding = FontEncodingNormalValue.ExtendedText;
			break;
		case "OML":
			encoding = FontEncodingNormalValue.MathItalic;
			break;
		case "OMS":
			encoding = FontEncodingNormalValue.MathSymbols;
			break;
		case "OMX":
			encoding = FontEncodingNormalValue.MathLargeSymbols;
			break;
		case "U":
			encoding = FontEncodingNormalValue.Unknown;
			break;
		default:
			throw new Error(`Unrecognized encoding value: ${rawCommand}`);
	}

	const fontEncoding = {
		type: FontEncodingType.Normal,
		encoding,
	};

	return fontEncoding;
}

export function parseFontFamily(rawCommand: string): string {
	if (!rawCommand) {
		throw new Error("Font family is empty");
	}
	return rawCommand;
}

const FONT_SERIES_RE = /^([ues]?[lb])?([ues]?[cx])?$/;
// TODO: Decide error handling and unknown values.
export function parseFontSeries(rawCommand: string): FontSeriesValue {
	const series = {
		weight: FontWeight.Medium,
		width: FontWidth.Medium,
	};
	if (rawCommand === "m") {
		return series;
	}

	const matches = rawCommand.match(FONT_SERIES_RE);
	if (!matches || matches.length !== 3) {
		return series;
	}

	const [_, rawWeight, rawWidth] = matches;

	if (!rawWeight && !rawWidth) {
		throw new Error(`Both weight and width are not reecognized: ${rawCommand}`);
	}

	if (rawWeight) {
		switch (rawWeight.toLocaleLowerCase()) {
			case "ul":
				series.weight = FontWeight.UltraLight;
				break;
			case "el":
				series.weight = FontWeight.ExtraLight;
				break;
			case "l":
				series.weight = FontWeight.Light;
				break;
			case "sl":
				series.weight = FontWeight.SemiLight;
				break;
			case "sb":
				series.weight = FontWeight.SemiBold;
				break;
			case "b":
				series.weight = FontWeight.Bold;
				break;
			case "eb":
				series.weight = FontWeight.ExtraBold;
				break;
			case "ub":
				series.weight = FontWeight.UltraBold;
				break;
			default:
				throw new Error(`Unrecognized weight: ${rawWeight}`);
		}
	}

	if (rawWidth) {
		switch (rawWidth.toLocaleLowerCase()) {
			case "uc":
				series.width = FontWidth.UltraCondensed;
				break;
			case "ec":
				series.width = FontWidth.ExtraCondensed;
				break;
			case "c":
				series.width = FontWidth.Condensed;
				break;
			case "sc":
				series.width = FontWidth.SemiCondensed;
				break;
			case "sx":
				series.width = FontWidth.SemiExpanded;
				break;
			case "x":
				series.width = FontWidth.Expanded;
				break;
			case "ex":
				series.width = FontWidth.ExtraExpanded;
				break;
			case "ux":
				series.width = FontWidth.UltraExpanded;
				break;
			default:
				throw new Error(`Unrecognized width: ${rawWidth}`);
		}
	}

	return series;
}

export function parseFontShape(rawCommand: string): FontShapeValue {
	switch (rawCommand.toLocaleLowerCase()) {
		case "n":
			return FontShapeValue.Normal;
		case "it":
			return FontShapeValue.Italic;
		case "sl":
			return FontShapeValue.Oblique;
		case "sc":
			return FontShapeValue.CapsAndSmallCaps;
		case "scit":
			return FontShapeValue.CapsAndSmallCapsItalics;
		case "scsl":
			return FontShapeValue.CapsAndSmallCapsOblique;
		case "sw":
			return FontShapeValue.Swash;
		case "ssc":
			return FontShapeValue.SpacedCapsAndSmallCaps;
		case "ui":
			return FontShapeValue.UprightItalic;
		default:
			throw new Error(`Unrecognized font shape: ${rawCommand}`);
	}
}

/**
 * Three capture groups: (initla digit)(.followingdigits)(unit)
 * If the unit is not present, it is assumed to be pt.
 */
const FONT_SIZE_RE =
	/^([0-9]+)(\.[0-9]+)?(pt|mm|cm|in|ex|em|mu|sp|vmin|vmax|vh|vw|cc|bp|dd|pc|px)?$/;
export function parseFontMeasurement(
	rawMeasurement: string,
): FontMeasurementValue {
	const matches = rawMeasurement.match(FONT_SIZE_RE);
	if (!matches || matches.length !== 4) {
		throw new Error(`Unrecognized font measurement: ${rawMeasurement}`);
	}

	const [_, rawValue, rawFloatPoint, rawUnit] = matches;
	const floatingPoint = rawFloatPoint || ".0";
	const value = Number.parseFloat(`${rawValue}${floatingPoint}`);

	const unit = parseFontSizeUnit(rawUnit);

	return { value, unit };
}

function parseFontSizeUnit(rawUnit?: string): FontSizeUnit {
	switch (rawUnit) {
		case "in":
			return FontSizeUnit.Inch;
		case "mm":
			return FontSizeUnit.Millimeter;
		case "cm":
			return FontSizeUnit.Centimeter;
		case "pc":
			return FontSizeUnit.Pica;
		case "dd":
			return FontSizeUnit.DidotPoint;
		case "cc":
			return FontSizeUnit.Cicero;
		case "sp":
			return FontSizeUnit.ScaledPoint;
		case "bp":
			return FontSizeUnit.BigPoint;
		case "em":
			return FontSizeUnit.Em;
		case "ex":
			return FontSizeUnit.Ex;
		case "mu":
			return FontSizeUnit.Mu;
		case "px":
			return FontSizeUnit.Pixel;
		case "vh":
			return FontSizeUnit.ViewportHeight;
		case "vw":
			return FontSizeUnit.ViewportWidth;
		case "vmin":
			return FontSizeUnit.ViewportMin;
		case "vmax":
			return FontSizeUnit.ViewportMax;
		default:
			return FontSizeUnit.Point;
	}
}

export function parseToFontValue<T>(
	token: Token,
	callback: (value: string) => T,
): FontValue<T> {
	if (token.type === TokenType.Command) {
		return {
			type: FontValueType.CommandToken,
			value: token,
		};
	}

	if (token.type === TokenType.Content) {
		return {
			type: FontValueType.FontValue,
			value: callback(token.literal.trim()),
		};
	}

	throw new Error("Token type must be either a command or content token");
}
