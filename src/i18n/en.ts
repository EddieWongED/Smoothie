import type { InternationalizationList } from "../typings/i18n/i18n.js";

const en: InternationalizationList = {
    // Command message
    pingMessage: "Pong!",
    optionsTitle: "`%ARG%`",
    optionsMessage: "= `%ARG%`",
    languageShowSuccessTitle: "Your language is...",
    languageShowSuccessMessage: "`%ARG%`",
    languageShowFailedMessage: "Failed to fetch your language.",
    languageUpdateSuccessMessage: "Switched to `%ARG%` successfully.",
    languageUpdateFailedMessage: "Failed to switch to `%ARG%`.",
    prefixShowSuccessTitle: "Your command prefix is...",
    prefixShowSuccessMessage: "`%ARG%`",
    prefixShowFailedMessage: "Failed to fetch your command prefix.",
    prefixUpdateSuccessMessage:
        "Your command prefix has been changed to `%ARG%`.",
    prefixUpdateFailedMessage:
        "Failed to change your command prefix to `%ARG%`.",
    prefixLengthErrorMessage: "The length of command prefix can only be 1-3.",
    joinFailedMessage: "Failed to join your voice channel.",
    joinSuccessMessage: "Joined your voice channel successfully.",
    leaveFailedMessage: "Failed to leave your voice channel.",
    leaveSuccessMessage: "Left your voice channel successfully.",
    createPlaylistFailedMessage: "Failed to create `%ARG%` playlist.",
    createPlaylistSuccessMessage: "Created `%ARG%` playlist successfully.",
    removePlaylistFailedMessage: "Failed to remove `%ARG%` playlist.",
    removePlaylistSuccessMessage: "Removed `%ARG%` playlist successfully.",
    confirmRemovePlaylistMessage:
        "Are you sure you want to remove `%ARG%` playlist?",
    cancelRemovePlaylistSuccessMessage:
        "Cancel removing `%ARG%` playlist successfully.",
    listPlaylistFailedMessage: "Failed to list all the playlists.",
    infoPlaylistFailedMessage: "Failed to show the info of `%ARG%` playlist.",
    currentInfoPlaylistFailedMessage:
        "Failed to show the info of current playlist.",
    switchPlaylistFailedMessage: "Failed to switch to `%ARG%` playlist.",
    switchPlaylistSuccessMessage: "Switch to `%ARG%` playlist successfully.",

    // Error message
    noSuchCommandMessage: "There is no `%ARG%` command.",
    tooFewInputMessage: "Too few input! (%ARG%)",
    tooManyInputMessage: "Too many input! (%ARG%)",
    requireIntegerMessage:
        "`%ARG%` requires an integer. Please try again. (%ARG%)",
    requireNumberMessage:
        "`%ARG%` requires a number. Please try again. (%ARG%)",
    noMatchChoiceMessage:
        "`%ARG%` does not accept `%ARG%` (%ARG%). Possible values(s): %ARG%",
    notInVoiceChannelMessage: "You are not in any voice channel!",
    playlistAlreadyExistMessage: "Playlist `%ARG%` already exist!",
    playlistDoesNotExistMessage: "Playlist `%ARG%` does not exist!",
    noPlaylistMessage: "You do not have any playlist!",
    playlistNameNotEmptyMessage: "Playlist's name cannot be empty!",
    noItemInListMessage: "There is no item in the list!",
    choosePageNotIntegerMessage:
        "The message you typed is not a integer! Please click the button and try again!",
    choosePageNotWithinRangeMessage:
        "The integer you typed is not within the range! Please click the button and try again!",
    noSonginPlaylistMessage: "You don't have any songs in the playlist!",

    // Others
    successTitle: "Success!",
    errorTitle: "Error!",
    errorCommandMessage: "There is an error running `%ARG%` command...",
    confirmTitle: "Are you sure?",
    confirmFooter: "You have %ARG% minute(s) to decide",
    cancelSuccessTitle: "Cancel Success!",
    loadingCommandTitle: "Loading...",
    loadingCommandMessage: "Loading `%ARG%` command...",
    choosePageTitle: "Please type which page you want to jump to",
    choosePageMessage: "Range: 1 - %ARG%. You have a minute to respond.",
    buttonDisableTimeFooter:
        "Button will be disabled after idling for %ARG% minute(s)",
    createdAtField: "Created At",
    numberOfSongsField: "Number of Song(s)",
    topFiveSongsField: "Top 5 Most Listened Songs",
};

export default en;
