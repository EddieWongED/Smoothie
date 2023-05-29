import type { Internationalization } from "../../i18n/i18n.js";

export type ReplyLevel = "success" | "info" | "warn" | "error";

export interface ReplyArgs {
    title: Internationalization;
    description: Internationalization;
    titleArgs?: string[];
    descriptionArgs?: string[];
}

export type LevelReplyArgs = { level: ReplyLevel } & ReplyArgs;
