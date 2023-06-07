/* eslint-disable @typescript-eslint/naming-convention */
export interface InternationalizationList {
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
    joinFailedMessage: string;
    joinSuccessMessage: string;
    leaveFailedMessage: string;
    leaveSuccessMessage: string;
    createPlaylistFailedMessage: string;
    createPlaylistSuccessMessage: string;
    removePlaylistFailedMessage: string;
    removePlaylistSuccessMessage: string;
    confirmRemovePlaylistMessage: string;
    cancelRemovePlaylistSuccessMessage: string;
    listPlaylistFailedMessage: string;
    infoPlaylistFailedMessage: string;
    currentInfoPlaylistFailedMessage: string;
    switchPlaylistFailedMessage: string;
    switchPlaylistSuccessMessage: string;
    playFailedMessage: string;
    playSuccessMessage: string;

    // Error message
    noSuchCommandMessage: string;
    tooFewInputMessage: string;
    tooManyInputMessage: string;
    requireIntegerMessage: string;
    requireNumberMessage: string;
    noMatchChoiceMessage: string;
    notInVoiceChannelMessage: string;
    playlistAlreadyExistMessage: string;
    playlistDoesNotExistMessage: string;
    noPlaylistMessage: string;
    playlistNameNotEmptyMessage: string;
    noItemInListMessage: string;
    choosePageNotIntegerMessage: string;
    choosePageNotWithinRangeMessage: string;
    noSonginPlaylistMessage: string;
    invalidYouTubeURLMessage: string;

    // Others
    successTitle: string;
    errorTitle: string;
    errorCommandMessage: string;
    confirmTitle: string;
    confirmFooter: string;
    cancelSuccessTitle: string;
    loadingCommandTitle: string;
    loadingCommandMessage: string;
    choosePageTitle: string;
    choosePageMessage: string;
    buttonDisableTimeFooter: string;
    createdAtField: string;
    numberOfSongsField: string;
    topFiveSongsField: string;
}

export enum Languages {
    en = "en",
    zh_hk = "zh-hk",
}

export type LanguageList = {
    [key in Languages]: InternationalizationList;
};

export type Language = keyof LanguageList;

export type Internationalization = keyof InternationalizationList;
