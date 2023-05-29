/* eslint-disable @typescript-eslint/naming-convention */
import Logging from "../structures/logging/Logging.js";
import type {
    Internationalization,
    Language,
    LanguageList,
} from "../typings/i18n/i18n.js";
import { Languages } from "../typings/i18n/i18n.js";
import en from "./en.js";
import zh_hk from "./zh-hk.js";

const languages: LanguageList = {
    [Languages.en]: en,
    [Languages.zh_hk]: zh_hk,
};

export function getLocale(
    language: Language,
    message: Internationalization,
    args: string[]
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

export const defaultLanguage = Languages.en as Language;
