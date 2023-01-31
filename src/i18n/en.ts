import type { Internationalization } from "../typings/i18n/i18n.js";

const en: Internationalization = {
    pingMessage: "Pong!",
    optionsNumberMessage: "`number` = `%ARG%`.",
    optionsIntegerMessage: "`integer` = `%ARG%`.",
    optionsStringMessage: "`string` = `%ARG%`.",
    optionsBooleanMessage: "`boolean` = `%ARG%`.",
    languageMessageSuccess: "Switched to `%ARG%` successfully.",
    languageMessageFailed: "Failed to switch to `%ARG%`.",
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
