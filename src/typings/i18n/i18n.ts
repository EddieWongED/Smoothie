/* eslint-disable @typescript-eslint/naming-convention */
export interface Internationalization {
    // Command message
    pingMessage: string;
    optionsTitle: string;
    optionsMessage: string;
    languageShowSuccessTitle: string;
    languageShowSuccessMessage: string;
    languageShowFailedMessage: string;
    languageUpdateSuccessMessage: string;
    languageUpdateFailedMessage: string;
    prefixShowSuccessTitle: string;
    prefixShowSuccessMessage: string;
    prefixShowFailedMessage: string;
    prefixUpdateSuccessMessage: string;
    prefixUpdateFailedMessage: string;
    prefixLengthErrorMessage: string;

    // Error message
    noSuchCommandMessage: string;
    tooFewInputMessage: string;
    tooManyInputMessage: string;
    requireIntegerMessage: string;
    requireNumberMessage: string;
    noMatchChoiceMessage: string;

    // Others
    successTitle: string;
    errorTitle: string;
    loadingCommandTitle: string;
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
