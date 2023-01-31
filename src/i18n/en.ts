import type { Internationalization } from "../typings/i18n/i18n.js";

const en: Internationalization = {
    pingMessage: "Pong!",
    optionsNumberMessage: "`number` = `%ARG%`.",
    optionsIntegerMessage: "`integer` = `%ARG%`.",
    optionsStringMessage: "`string` = `%ARG%`.",
    optionsBooleanMessage: "`boolean` = `%ARG%`.",
    languageShowMessageSuccess: "Your language is: `%ARG%`.",
    languageShowMessageFailed: "Failed to fetch your language.",
    languageUpdateMessageSuccess: "Switched to `%ARG%` successfully.",
    languageUpdateMessageFailed: "Failed to switch to `%ARG%`.",
    prefixShowMessageSuccess: "Your command prefix is: `%ARG%`.",
    prefixShowMessageFailed: "Failed to fetch your command prefix.",
    prefixUpdateMessageSuccess:
        "Your command prefix has been changed to `%ARG%`.",
    prefixUpdateMessageFailed:
        "Failed to change your command prefix to `%ARG%`.",
    prefixLengthErrorMessage: "The length of command prefix can only be 1-3.",
    noSuchCommandMessage: "There is no `%ARG%` command.",
    tooFewInputMessage: "Too few input! (%ARG%)",
    tooManyInputMessage: "Too many input! (%ARG%)",
    requireIntegerMessage:
        "`%ARG%` requires an integer. Please try again. (%ARG%)",
    requireNumberMessage:
        "`%ARG%` requires a number. Please try again. (%ARG%)",
    noMatchChoiceMessage:
        "`%ARG%` does not accept `%ARG%` (%ARG%). Possible values(s): %ARG%",
    loadingCommandMessage: "Loading `%ARG%` command...",
};

export default en;
