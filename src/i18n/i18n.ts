/* eslint-disable @typescript-eslint/naming-convention */
import Logging from "../structures/logging/Logging.js";
import type {
    Internationalization,
    Language,
    LanguageList,
} from "../typings/i18n/i18n.js";
import { Languages } from "../typings/i18n/i18n.js";
import en_US from "./en-US.js";
import zh_TW from "./zh-TW.js";

const languages: LanguageList = {
    [Languages.en_us]: en_US,
    [Languages.zh_tw]: zh_TW,
};

export function getLocale(
    language: Language,
    message: Internationalization,
    args: string[] = []
): string {
    const locale = languages[language][message];
    const noOfArgsNeeded = (locale.match(/%ARG%/g) ?? []).length;
    if (args.length !== noOfArgsNeeded) {
        Logging.warn(
            `The number of arguments provided (${args.length}) and the number of arguments needed for ${message} (${noOfArgsNeeded}) do not match. It might produce unintended behaviour.`
        );
    }

    let count = 0;
    return locale.replace(/%ARG%/g, () => {
        const arg = args[count] ?? "";
        count++;
        return arg;
    });
}

export const defaultLanguage = Languages.en_us as Language;
