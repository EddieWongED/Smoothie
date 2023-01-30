/* eslint-disable @typescript-eslint/naming-convention */
import type { Internationalization } from "../typings/i18n/i18n.js";

const zh_hk: Internationalization = {
    pingMessage: "Pong！你輸入左嘅數字係 %ARG%。",
    optionsMessage:
        "number = %ARG%, integer = %ARG%, string = %ARG%, boolean = %ARG%。",
    languageMessageSuccess: "成功轉咗做 `%ARG%`。",
    languageMessageFailed: "轉唔到做 `%ARG%`。",
    noSuchCommandMessage: "冇 `%ARG%` 呢個指令。",
    tooFewInputMessage: "輸入得太少嘢啦！（%ARG%）",
    tooManyInputMessage: "輸入得太多嘢啦！（%ARG%）",
    requireIntegerMessage: "`%ARG%` 要一個整數。請再嚟一次。（%ARG%）",
    requireNumberMessage: "`%ARG%` 要一個數字。請再嚟一次。（%ARG%）",
    noMatchChoiceMessage: "`%ARG%` 唔接受 `%ARG%`（%ARG%）。你可以輸入︰%ARG%",
};

export default zh_hk;
