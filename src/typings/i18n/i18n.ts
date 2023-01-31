/* eslint-disable @typescript-eslint/naming-convention */
export interface Internationalization {
    // Command message
    pingMessage: string;
    optionsNumberMessage: string;
    optionsIntegerMessage: string;
    optionsStringMessage: string;
    optionsBooleanMessage: string;
    languageMessageSuccess: string;
    languageMessageFailed: string;

    // Error message
    noSuchCommandMessage: string;
    tooFewInputMessage: string;
    tooManyInputMessage: string;
    requireIntegerMessage: string;
    requireNumberMessage: string;
    noMatchChoiceMessage: string;

    // Others
    loadingCommandMessage: string;
}

export enum Languages {
    en = "en",
    zh_hk = "zh-hk",
}

export interface LanguageList {
    [Languages.en]: Internationalization;
    [Languages.zh_hk]: Internationalization;
}
