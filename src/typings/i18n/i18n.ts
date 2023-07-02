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
    listPlaylistTitle: string;
    infoPlaylistFailedMessage: string;
    currentInfoPlaylistFailedMessage: string;
    switchPlaylistFailedMessage: string;
    switchPlaylistSuccessMessage: string;
    playFailedMessage: string;
    playSuccessMessage: string;
    playSingleSuccessMessage: string;
    playPlaylistSuccessMessage: string;
    queueTitle: string;
    queueFailedMessage: string;
    skipFailedMessage: string;
    skipSuccessMessage: string;
    removeFailedMessage: string;
    removeSuccessMessage: string;
    removeIndexOutOfRangeMessage: string;
    confirmRemoveSongMessage: string;
    cancelRemoveSongSuccessMessage: string;
    pauseFailedMessage: string;
    pauseSuccessMessage: string;
    unpauseFailedMessage: string;
    unpauseSuccessMessage: string;
    retryFailedMessage: string;
    retrySuccessMessage: string;
    shuffleFailedMessage: string;
    shuffleSuccessMessage: string;
    searchFailedMessage: string;
    searchTitle: string;
    stayRankTitle: string;
    stayRankFailedMessage: string;
    queueRankTitle: string;
    queueRankFailedMessage: string;
    prevFailedMessage: string;
    helpMessage: string;
    helpFailedMessage: string;

    // Command Description
    helpCommandOptionDescription: string;
    helpDescription: string;
    testDescription: string;
    languageLanguageOptionDescription: string;
    languageDescription: string;
    pingDescription: string;
    prefixPrefixOptionDescription: string;
    prefixDescription: string;
    rankActionOptionDescription: string;
    rankDescription: string;
    stayRankDescription: string;
    createPlaylistNameOptionDescription: string;
    createPlaylistDescription: string;
    infoPlaylistNameOptionDescription: string;
    infoPlaylistDescription: string;
    listPlaylistDescription: string;
    playlistActionOptionDescription: string;
    playlistNameOptionDescription: string;
    playlistDescription: string;
    removePlaylistNameOptionDescription: string;
    removePlaylistDescription: string;
    switchPlaylistNameOptionDescription: string;
    switchPlaylistDescription: string;
    joinDescription: string;
    leaveDescription: string;
    pauseDescription: string;
    playURLOptionDescription: string;
    playWhenOptionDescription: string;
    playDescription: string;
    prevDescription: string;
    queueDescription: string;
    queueRankDescription: string;
    removeIndexOptionDescription: string;
    removeDescription: string;
    retryDescription: string;
    searchQueryOptionDescription: string;
    searchDescription: string;
    shuffleDescription: string;
    skipDescription: string;
    unpauseDescription: string;

    // Error message
    noSuchCommandMessage: string;
    noSuchCommandWithSuggestionMessage: string;
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
    playSongFailedMessage: string;
    noUpComingSongMessage: string;

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
    selectMenuDisableTimeFooter: string;
    selectMenuPlaceholder: string;
    createdAtField: string;
    numberOfSongsField: string;
    topFiveSongsField: string;
    totalDurationField: string;
    uploadedByField: string;
    addedAtField: string;
    playCountField: string;
    playlistField: string;
    upComingField: string;
    playingNowTitle: string;
    queueButton: string;
    playlistInfoButton: string;
    genericCommandTitle: string;
    possibleValueDescription: string;
    requiredFieldFooter: string;
    syntaxField: string;
    aliasesField: string;
    autoSwitchPlaylistTitle: string;
    autoSwitchPlaylistMessage: string;
}

export enum Languages {
    en_us = "en-US",
    zh_tw = "zh-TW",
}

export type LanguageList = {
    [key in Languages]: InternationalizationList;
};

export type Language = keyof LanguageList;

export type Internationalization = keyof InternationalizationList;
