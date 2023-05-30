import type { Internationalization } from "../../i18n/i18n.js";
import type { LoggingLevel } from "../logging/Logging.js";

export interface ReplyArgs {
    title: Internationalization;
    description: Internationalization;
    titleArgs?: string[];
    descriptionArgs?: string[];
}

export type LevelReplyArgs = { level: LoggingLevel } & ReplyArgs;
