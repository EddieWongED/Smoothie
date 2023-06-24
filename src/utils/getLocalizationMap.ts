import type { LocalizationMap } from "discord.js";
import { getLocale } from "../i18n/i18n.js";
import type { Internationalization } from "../typings/i18n/i18n.js";
import { Languages } from "../typings/i18n/i18n.js";

const getLocalizationMap = (message: Internationalization) => {
    return Object.assign(
        {},
        ...Object.values(Languages).map((lang) => {
            return {
                [lang]: getLocale(lang, message),
            };
        })
    ) as LocalizationMap;
};

export default getLocalizationMap;
