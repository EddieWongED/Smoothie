import type { BaseMessageOptions } from "discord.js";
import type { LoggingLevel } from "../../typings/structures/logging/Logging.js";
import type {
    BasicEmbedArgs,
    LevelEmbedArgs,
} from "../../typings/structures/embed/Embed.js";
import BasicEmbed from "./BasicEmbed.js";
import { Emojis } from "../../typings/emoji/Emoji.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class LevelEmbed {
    static create({
        level,
        title,
        description = null,
    }: LevelEmbedArgs): BaseMessageOptions {
        // Create Embed
        title = this._getPrefixedTitle(level, title);
        const embed = BasicEmbed.create({
            title: title,
            description: description,
            color: this._getColor(level),
        });

        return embed;
    }

    static info({
        title,
        description = null,
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "info",
            title: title,
            description: description,
        });
    }

    static success({
        title,
        description = null,
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "success",
            title: title,
            description: description,
        });
    }

    static warn({
        title,
        description = null,
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "warn",
            title: title,
            description: description,
        });
    }

    static error({
        title,
        description = null,
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "error",
            title: title,
            description: description,
        });
    }

    private static _getColor(level: LoggingLevel): number {
        switch (level) {
            case "info":
                return 0x5856d6;
            case "success":
                return 0x34c759;
            case "warn":
                return 0xff9f0a;
            case "error":
                return 0xcf000f;
        }
    }

    private static _getPrefixedTitle(level: LoggingLevel, title: string) {
        switch (level) {
            case "success": {
                return `${Emojis.tick} ${title}`;
            }
            case "warn": {
                return `${Emojis.warning} ${title}`;
            }
            case "error": {
                return `${Emojis.error} ${title}`;
            }
            default: {
                return title;
            }
        }
    }
}
