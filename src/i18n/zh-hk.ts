/* eslint-disable @typescript-eslint/naming-convention */
import type { Internationalization } from "../typings/i18n/i18n.js";

const zh_hk: Internationalization = {
    pingMessage: "Pong！",
    optionsNumberMessage: "`number` = `%ARG%`。",
    optionsIntegerMessage: "`integer` = `%ARG%`。",
    optionsStringMessage: "`string` = `%ARG%`。",
    optionsBooleanMessage: "`boolean` = `%ARG%`。",
    languageMessageSuccess: "成功轉咗做 `%ARG%`。",
    languageMessageFailed: "轉唔到做 `%ARG%`。",
    noSuchCommandMessage: "冇 `%ARG%` 呢個指令。",
    tooFewInputMessage: "輸入得太少嘢啦！（%ARG%）",
    tooManyInputMessage: "輸入得太多嘢啦！（%ARG%）",
    requireIntegerMessage: "`%ARG%` 要一個整數。請再嚟一次。（%ARG%）",
    requireNumberMessage: "`%ARG%` 要一個數字。請再嚟一次。（%ARG%）",
    noMatchChoiceMessage: "`%ARG%` 唔接受 `%ARG%`（%ARG%）。你可以輸入︰%ARG%",
    loadingCommandMessage: "Load緊 `%ARG%` 指令...",
};

export default zh_hk;
