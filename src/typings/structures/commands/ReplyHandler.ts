import type { APISelectMenuOption } from "discord.js";
import type { Internationalization } from "../../i18n/i18n.js";
import type { LoggingLevel } from "../logging/Logging.js";
import type { Emojis } from "../../emoji/Emoji.js";

export interface ReplyArgs {
    title: Internationalization;
    description: Internationalization;
    titleArgs?: string[];
    descriptionArgs?: string[];
    emoji?: Emojis | undefined;
}

export type FollowUpArgs = { willEdit?: boolean } & ReplyArgs;

export type SendArgs = { willEdit?: boolean } & ReplyArgs;

export type QueryArgs = { userId?: string } & ReplyArgs;

export type OptionsArgs = {
    options: APISelectMenuOption[];
} & ReplyArgs;

export type LevelReplyArgs = { level: LoggingLevel } & ReplyArgs;

export interface ListReplyArgs {
    title: Internationalization;
    list: string[];
    titleArgs?: string[];
    itemsPerPage?: number;
    indexing?: boolean;
    emoji?: Emojis | undefined;
}
