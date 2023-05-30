/* eslint-disable @typescript-eslint/naming-convention */
import type { InternationalizationList } from "../typings/i18n/i18n.js";

const zh_hk: InternationalizationList = {
    // Command message
    pingMessage: "Pong！",
    optionsTitle: "`%ARG%`",
    optionsMessage: "= `%ARG%`",
    languageShowSuccessTitle: "您的語言是...",
    languageShowSuccessMessage: "`%ARG%`",
    languageShowFailedMessage: "未能讀取您的語言。",
    languageUpdateSuccessMessage: "成功將語言切換到 `%ARG%`。",
    languageUpdateFailedMessage: "無法將語言切換到 `%ARG%`。",
    prefixShowSuccessTitle: "您的指令 prefix 是...",
    prefixShowSuccessMessage: "`%ARG%`",
    prefixShowFailedMessage: "未能讀取您的指令 prefix。",
    prefixUpdateSuccessMessage: "成功將指令 prefix 切換到 `%ARG%`。",
    prefixUpdateFailedMessage: "無法將指令 prefix 切換到 `%ARG%`。",
    prefixLengthErrorMessage: "指令 prefix 的長度必須為 1-3。",
    joinFailedMessage: "無法進入您的語音頻道。",
    joinSuccessMessage: "成功進入您的語音頻道。",
    leaveFailedMessage: "無法離開您的語音頻道。",
    leaveSuccessMessage: "成功離開了您的語音頻道。",

    // Error message
    noSuchCommandMessage: "沒有 `%ARG%` 這個指令。",
    tooFewInputMessage: "輸入過少！（%ARG%）",
    tooManyInputMessage: "輸入過多！（%ARG%）",
    requireIntegerMessage: "`%ARG%` 要一個整數。請再試一次。（%ARG%）",
    requireNumberMessage: "`%ARG%` 要一個數字。請再試一次。（%ARG%）",
    noMatchChoiceMessage: "`%ARG%` 不接受 `%ARG%`（%ARG%）。您可以輸入︰%ARG%",
    notInVoiceChannelMessage: "您不在任何一個語音頻道中！",

    // Others
    successTitle: "成功！",
    errorTitle: "錯誤...",
    loadingCommandTitle: "載入中...",
    loadingCommandMessage: "正在載入 `%ARG%` 指令...",
};

export default zh_hk;
