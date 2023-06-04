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
    createPlaylistFailedMessage: "無法建立 `%ARG%` 播放清單。",
    createPlaylistSuccessMessage: "成功建立了 `%ARG%` 播放清單。",
    removePlaylistFailedMessage: "無法移除 `%ARG%` 播放清單。",
    removePlaylistSuccessMessage: "成功移除了 `%ARG%` 播放清單。",
    confirmRemovePlaylistMessage: "您確定要移除 `%ARG%` 播放清單嗎？",
    cancelRemovePlaylistSuccessMessage: "成功取消移除 `%ARG%` 播放清單。",
    listPlaylistFailedMessage: "無法列出所有播放清單。",

    // Error message
    noSuchCommandMessage: "沒有 `%ARG%` 這個指令。",
    tooFewInputMessage: "輸入過少！（%ARG%）",
    tooManyInputMessage: "輸入過多！（%ARG%）",
    requireIntegerMessage: "`%ARG%` 要一個整數。請再試一次。（%ARG%）",
    requireNumberMessage: "`%ARG%` 要一個數字。請再試一次。（%ARG%）",
    noMatchChoiceMessage: "`%ARG%` 不接受 `%ARG%`（%ARG%）。您可以輸入︰%ARG%",
    notInVoiceChannelMessage: "您不在任何一個語音頻道中！",
    playlistAlreadyExistMessage: "播放清單 `%ARG%` 已存在！",
    playlistDoesNotExistMessage: "播放清單 `%ARG%` 不存在！",
    noPlaylistMessage: "您沒有任何播放清單！",
    playlistNameNotEmptyMessage: "播放清單名字不能是空白！",
    noItemInListMessage: "列表中沒有物件！",
    choosePageNotIntegerMessage: "您輸入的信息不是一個整數！請再次點擊按鈕！",
    choosePageNotWithinRangeMessage: "您輸入的整數不在範圍內！請再次點擊按鈕！",

    // Others
    successTitle: "成功！",
    errorTitle: "錯誤...",
    errorCommandMessage: "運行 `%ARG%` 指令時出現了錯誤...",
    confirmTitle: "您確定嗎？",
    confirmFooter: "您有 %ARG% 分鐘的時間來決定",
    cancelSuccessTitle: "取消成功！",
    loadingCommandTitle: "載入中...",
    loadingCommandMessage: "正在載入 `%ARG%` 指令...",
    choosePageTitle: "請輸入您想跳轉到的頁面",
    choosePageMessage: "範圍為 1 - %ARG%。你有一分鐘的時間來回應。",
    buttonDisableTimeFooter: "閒置 %ARG% 分鐘後按鈕將會停用",
};

export default zh_hk;
