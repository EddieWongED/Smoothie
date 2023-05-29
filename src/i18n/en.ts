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

    // Others
    successTitle: "Success!",
    errorTitle: "Error!",
    loadingCommandTitle: "Loading...",
    loadingCommandMessage: "Loading `%ARG%` command...",
};

export default en;
