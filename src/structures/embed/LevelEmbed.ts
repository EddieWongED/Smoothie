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
        emoji = this._getEmoji(level),
    }: LevelEmbedArgs): BaseMessageOptions {
        // Create Embed
        const embed = BasicEmbed.create({
            title: title,
            description: description,
            color: this._getColor(level),
            emoji: emoji,
        });

        return embed;
    }

    static info({
        title,
        description = null,
        emoji = this._getEmoji("info"),
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "info",
            title: title,
            description: description,
            emoji: emoji,
        });
    }

    static success({
        title,
        description = null,
        emoji = this._getEmoji("success"),
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "success",
            title: title,
            description: description,
            emoji: emoji,
        });
    }

    static warn({
        title,
        description = null,
        emoji = this._getEmoji("warn"),
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "warn",
            title: title,
            description: description,
            emoji: emoji,
        });
    }

    static error({
        title,
        description = null,
        emoji = this._getEmoji("error"),
    }: BasicEmbedArgs): BaseMessageOptions {
        return this.create({
            level: "error",
            title: title,
            description: description,
            emoji: emoji,
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
            default:
                return 0x000000;
        }
    }

    private static _getEmoji(level: LoggingLevel) {
        switch (level) {
            case "success": {
                return Emojis.tick;
            }
            case "warn": {
                return Emojis.warning;
            }
            case "error": {
                return Emojis.error;
            }
            default: {
                return undefined;
            }
        }
    }
}
