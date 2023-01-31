import type { LanguageList } from "../../i18n/i18n.js";

export default interface LanguageOptions {
    language?: keyof LanguageList;
}
