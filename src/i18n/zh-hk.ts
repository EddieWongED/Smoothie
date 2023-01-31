/* eslint-disable @typescript-eslint/naming-convention */
import type { Internationalization } from "../typings/i18n/i18n.js";

const zh_hk: Internationalization = {
    pingMessage: "Pong！",
    optionsNumberMessage: "`number` = `%ARG%`。",
    optionsIntegerMessage: "`integer` = `%ARG%`。",
    optionsStringMessage: "`string` = `%ARG%`。",
    optionsBooleanMessage: "`boolean` = `%ARG%`。",
    languageShowMessageSuccess: "你嘅語言係：`%ARG%`。",
    languageShowMessageFailed: "Load唔到你用咩語言。",
    languageUpdateMessageSuccess: "成功轉語言做 `%ARG%`。",
    languageUpdateMessageFailed: "轉唔到語言做 `%ARG%`。",
    prefixShowMessageSuccess: "你嘅 command prefix 係：`%ARG%`。",
    prefixShowMessageFailed: "Load唔到你個 command prefix。",
    prefixUpdateMessageSuccess: "成功轉 command prefix 做 `%ARG%`。",
    prefixUpdateMessageFailed: "轉唔到 command prefix 做 `%ARG%`。",
    prefixLengthErrorMessage: "command prefix 嘅長度一定要係 1-3。",
    noSuchCommandMessage: "冇 `%ARG%` 呢個指令。",
    tooFewInputMessage: "輸入得太少嘢啦！（%ARG%）",
    tooManyInputMessage: "輸入得太多嘢啦！（%ARG%）",
    requireIntegerMessage: "`%ARG%` 要一個整數。請再嚟一次。（%ARG%）",
    requireNumberMessage: "`%ARG%` 要一個數字。請再嚟一次。（%ARG%）",
    noMatchChoiceMessage: "`%ARG%` 唔接受 `%ARG%`（%ARG%）。你可以輸入︰%ARG%",
    loadingCommandMessage: "Load緊 `%ARG%` 指令...",
};

export default zh_hk;
