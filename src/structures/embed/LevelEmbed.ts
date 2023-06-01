import { EmbedBuilder } from "@discordjs/builders";
import type { BaseMessageOptions } from "discord.js";
import { AttachmentBuilder } from "discord.js";
import type { LoggingLevel } from "../../typings/structures/logging/Logging.js";
import type {
    EmbedArgs,
    LevelEmbedArgs,
} from "../../typings/structures/embed/Embed.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class LevelEmbed {
    static create({
        level,
        title,
        description,
    }: LevelEmbedArgs): BaseMessageOptions {
        // Create File
        const file = new AttachmentBuilder("./icons/mipmap-hdpi/smoothie.png");

        // Create Embed
        title = this._getPrefixedTitle(level, title);
        const embed = this._createBasicEmbed({
            title: title,
            description: description,
        }).setColor(this._getColor(level));

        return { embeds: [embed], files: [file] };
    }

    static info({ title, description }: EmbedArgs): BaseMessageOptions {
        return this.create({
            level: "info",
            title: title,
            description: description,
        });
    }

    static success({ title, description }: EmbedArgs): BaseMessageOptions {
        return this.create({
            level: "success",
            title: title,
            description: description,
        });
    }

    static warn({ title, description }: EmbedArgs): BaseMessageOptions {
        return this.create({
            level: "warn",
            title: title,
            description: description,
        });
    }

    static error({ title, description }: EmbedArgs): BaseMessageOptions {
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

    private static _createBasicEmbed({
        title,
        description,
    }: EmbedArgs): EmbedBuilder {
        if (title.length > 256) {
            title = title.substring(0, 253) + "...";
        }

        if (description.length > 4096) {
            description = description.substring(0, 4093) + "...";
        }

        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setTimestamp()
            .setFooter({
                text: "Smoothie",
                iconURL: "attachment://smoothie.png",
            });
    }

    private static _getPrefixedTitle(level: LoggingLevel, title: string) {
        switch (level) {
            case "success": {
                return ":white_check_mark: " + title;
            }
            case "warn": {
                return ":warning: " + title;
            }
            case "error": {
                return ":no_entry: " + title;
            }
            default: {
                return title;
            }
        }
    }
}
