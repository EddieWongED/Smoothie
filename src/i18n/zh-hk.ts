/* eslint-disable @typescript-eslint/naming-convention */
import type { InternationalizationList } from "../typings/i18n/i18n.js";

const zh_hk: InternationalizationList = {
    // Command message
    pingMessage: "Pong！",
    optionsTitle: "`%ARG%`",
    optionsMessage: "= `%ARG%`",
    languageShowSuccessTitle: "你嘅語言係...",
    languageShowSuccessMessage: "`%ARG%`",
    languageShowFailedMessage: "Load唔到你用咩語言。",
    languageUpdateSuccessMessage: "成功將語言轉做 `%ARG%`。",
    languageUpdateFailedMessage: "轉唔到語言做 `%ARG%`。",
    prefixShowSuccessTitle: "你嘅 command prefix 係...",
    prefixShowSuccessMessage: "`%ARG%`",
    prefixShowFailedMessage: "Load唔到你個 command prefix。",
    prefixUpdateSuccessMessage: "成功將 command prefix 轉做 `%ARG%`。",
    prefixUpdateFailedMessage: "轉唔到 command prefix 做 `%ARG%`。",
    prefixLengthErrorMessage: "command prefix 嘅長度一定要係 1-3。",
    joinFailedMessage: "嘗試入你個 voice channel 但係失敗咗。",
    joinSuccessMessage: "成功入咗你個 voice channel。",
    leaveFailedMessage: "嘗試離開你個 voice channel 但係失敗咗。",
    leaveSuccessMessage: "成功離開咗你個 voice channel。",

    // Error message
    noSuchCommandMessage: "冇 `%ARG%` 呢個指令。",
    tooFewInputMessage: "輸入得太少嘢啦！（%ARG%）",
    tooManyInputMessage: "輸入得太多嘢啦！（%ARG%）",
    requireIntegerMessage: "`%ARG%` 要一個整數。請再嚟一次。（%ARG%）",
    requireNumberMessage: "`%ARG%` 要一個數字。請再嚟一次。（%ARG%）",
    noMatchChoiceMessage: "`%ARG%` 唔接受 `%ARG%`（%ARG%）。你可以輸入︰%ARG%",
    notInVoiceChannelMessage: "你唔係任何一個 voice channel 入面！",

    // Others
    successTitle: "得咗！",
    errorTitle: "唔得喎...",
    loadingCommandTitle: "Load緊...",
    loadingCommandMessage: "Load緊 `%ARG%` 指令...",
};

export default zh_hk;
