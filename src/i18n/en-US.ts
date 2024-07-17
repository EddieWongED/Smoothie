import type { InternationalizationList } from "../typings/i18n/i18n.js";

// eslint-disable-next-line @typescript-eslint/naming-convention
const en_US: InternationalizationList = {
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
    listPlaylistTitle: "Playlists",
    infoPlaylistFailedMessage: "Failed to show the info of `%ARG%` playlist.",
    currentInfoPlaylistFailedMessage:
        "Failed to show the info of current playlist.",
    switchPlaylistFailedMessage: "Failed to switch to `%ARG%` playlist.",
    switchPlaylistSuccessMessage: "Switch to `%ARG%` playlist successfully.",
    queueTitle: "`%ARG%`'s Queue",
    queueFailedMessage: "Failed to show the queue of the current playlist.",
    skipFailedMessage: "Failed to skip the current song.",
    skipSuccessMessage: "Skipped `%ARG%` successfully.",
    removeFailedMessage: "Failed to remove the required song.",
    removeSuccessMessage: "Removed `%ARG%` successfully.",
    removeIndexOutOfRangeMessage:
        "Please choose between `1` and `%ARG%` as the index of the song you want to remove.",
    confirmRemoveSongMessage: "Are you sure you want to remove `%ARG%`?",
    cancelRemoveSongSuccessMessage: "Cancel removing `%ARG%` successfully.",
    pauseFailedMessage: "Failed to pause the song.",
    pauseSuccessMessage: "Paused the song successfully.",
    unpauseFailedMessage: "Failed to unpause the song.",
    unpauseSuccessMessage: "Unpause the song successfully.",
    retryFailedMessage: "Failed to play the first song.",
    retrySuccessMessage: "Played the first song `%ARG%` successfully.",
    shuffleFailedMessage: "Failed to shuffle the queue.",
    shuffleSuccessMessage: "Shuffled the queue successfully.",
    searchFailedMessage: "Cannot find songs that are similar to `%ARG%`.",
    searchTitle: "Search Result of `%ARG%`",
    stayRankTitle: "Ranking of Hanging Around in Voice Channel with Smoothie",
    stayRankFailedMessage:
        "Failed to show the ranking of hanging around in voice channel with Smoothie.",
    queueRankTitle:
        "Ranking of The Number of Times Played of Each Song in `%ARG%` Playlist",
    queueRankFailedMessage:
        "Failed to show the ranking of the number of times played of each song in the playlist.",
    helpMessage: "Choose which command you want to know the information about.",
    helpFailedMessage: "Failed to run the `help` command.",

    // Command Description
    helpCommandOptionDescription: "The command you want the information about.",
    helpDescription: "Provide information on other commands.",
    testDescription: "For developer testing only!",
    languageLanguageOptionDescription: "The language code.",
    languageDescription: "Show / Change language.",
    pingDescription: "Reply with pong!",
    prefixPrefixOptionDescription: "Change command prefix.",
    prefixDescription: "Show / Change prefix.",
    rankActionOptionDescription: "Action to be performed.",
    rankDescription: "Show some ranking within the guild.",
    stayRankDescription: "Show the ranking of voice channel stay duration.",
    createPlaylistNameOptionDescription: "The name of the playlist.",
    createPlaylistDescription: "Create a new playlist.",
    infoPlaylistNameOptionDescription:
        "The name of the playlist which you want the info of.",
    infoPlaylistDescription:
        "Show the info of a playlist. If no name is given, the current playlist's info will be shown.",
    listPlaylistDescription: "List all the playlists.",
    playlistActionOptionDescription: "Action to be performed.",
    playlistNameOptionDescription:
        "The name of the playlist to be removed / created / shown / switched to.",
    playlistDescription:
        "Remove / Create / Show / Switch to / List / playlist.",
    removePlaylistNameOptionDescription:
        "The name of the playlist to be removed.",
    removePlaylistDescription: "Remove a playlist.",
    switchPlaylistNameOptionDescription:
        "The name of the playlist you want to switch to.",
    switchPlaylistDescription: "Switch to another playlist.",
    joinDescription: "Join your voice channel.",
    leaveDescription: "Leave your voice channel.",
    pauseDescription: "Pause the current song.",
    playURLOptionDescription: "The YouTube URL of the song.",
    playWhenOptionDescription: "When should the song be played.",
    playDescription: "Play the song of the provided YouTube URL.",
    prevDescription: "Play the previous song.",
    queueDescription: "Show the queue of the current playlist.",
    queueRankDescription:
        "Show the ranking of the number of times played of each song in the current queue.",
    removeIndexOptionDescription: "The index of the song to be removed.",
    removeDescription: "Remove a song from the list.",
    retryDescription:
        "Try to play the first song again. Useful when there was error playing the song before.",
    searchQueryOptionDescription:
        "The keywords of songs you want to search from your queue.",
    searchDescription: "Search songs from your queue.",
    shuffleDescription: "Shuffle the current queue.",
    skipDescription: "Skip the current song.",
    unpauseDescription: "Unpause the current song.",

    // Error message
    noSuchCommandMessage: "There is no `%ARG%` command.",
    noSuchCommandWithSuggestionMessage:
        "There is no `%ARG%` command. Did you mean `%ARG%`?",
    tooFewInputMessage: "Too few input!",
    tooManyInputMessage: "Too many input!",
    requireIntegerMessage: "`%ARG%` requires an integer. Please try again.",
    requireNumberMessage: "`%ARG%` requires a number. Please try again.",
    noMatchChoiceMessage:
        "`%ARG%` does not match any possible value(s) of `%ARG%`.",
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
    invalidYouTubeURLMessage:
        "Invalid YouTube URL! The reason maybe is because it is a private / age-restricted / deleted video.",
    playFailedMessage: "Failed to play the song(s) with URL = `%ARG%`.",
    playSuccessMessage: "Played `%ARG%` successfully.",
    playSingleSuccessMessage: "Added `%ARG%` successfully.",
    playPlaylistSuccessMessage:
        "Added `%ARG%` new song(s) to the queue. `%ARG%` song(s) was/were already in the queue so they didn't get added.",
    playSongFailedMessage:
        "Failed to play the current song (`%ARG%`). It may be a private / age-restricted / deleted video, or network problem. Please try again with the retry command. If the problem persists, please skip the song or remove the song from the playlist.\nThe music player has been paused.",
    noUpComingSongMessage: "You don't have any up coming song!",
    prevFailedMessage: "Failed to play the previous song.",

    // Others
    successTitle: "Success!",
    errorTitle: "Error!",
    errorCommandMessage: "There is an error running `%ARG%` command...",
    unknownStreamErrorMessage:
        "Unknown audio streaming error occurred... Please try again with the retry command. If the problem persists, please skip the song or remove the song from the playlist.",
    confirmTitle: "Are you sure?",
    confirmFooter: "You have %ARG% minute(s) to decide",
    cancelSuccessTitle: "Cancel Success!",
    loadingCommandTitle: "Loading...",
    loadingCommandMessage: "Loading `%ARG%` command...",
    choosePageTitle: "Please type which page you want to jump to",
    choosePageMessage: "Range: 1 - %ARG%. You have a minute to respond.",
    buttonDisableTimeFooter:
        "Button will be disabled after idling for %ARG% minute(s)",
    selectMenuDisableTimeFooter:
        "Select Menu will be disable after %ARG% minute(s)",
    selectMenuPlaceholder: "Menu",
    createdAtField: "Created At",
    numberOfSongsField: "Number of Song(s)",
    topFiveSongsField: "Top 5 Most Listened Songs",
    totalDurationField: "Total Duration",
    uploadedByField: "Uploaded By",
    addedAtField: "Added At",
    playCountField: "Play Count",
    playlistField: "Playlist",
    upComingField: "Up Coming",
    playingNowTitle: "Playing Now",
    queueButton: "Queue",
    playlistInfoButton: "Playlist",
    genericCommandTitle: "`%ARG%` Command",
    possibleValueDescription: "Possible Value(s): ",
    requiredFieldFooter: "* Required field",
    syntaxField: "Syntax",
    aliasesField: "Alias(es)",
    autoSwitchPlaylistTitle: "Automatically Switched to `%ARG%` Playlist",
    autoSwitchPlaylistMessage:
        "Since you have removed the playlist that you are current playing, the current playlist has been switched to `%ARG%` instead.",
};

export default en_US;
