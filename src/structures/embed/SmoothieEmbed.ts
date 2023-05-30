import { EmbedBuilder } from "@discordjs/builders";
import { AttachmentBuilder } from "discord.js";
import type { ReplyLevel } from "../../typings/structures/commands/ReplyHandler.js";
import type {
    EmbedArgs,
    LevelEmbedArgs,
    SmoothieEmbedOutput,
} from "../../typings/structures/embed/SmoothieEmbed.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class SmoothieEmbed {
    static create({
        level,
        title,
        description,
    }: LevelEmbedArgs): SmoothieEmbedOutput {
        const file = new AttachmentBuilder("./icons/mipmap-hdpi/smoothie.png");
        switch (level) {
            case "success": {
                title = ":white_check_mark: " + title;
                break;
            }
            case "warn": {
                title = ":warning: " + title;
                break;
            }
            case "error": {
                title = ":no_entry: " + title;
                break;
            }
        }
        const embed = this._createBasicEmbed({
            title: title,
            description: description,
        }).setColor(this._getColor(level));
        return { embeds: [embed], files: [file] };
    }

    static success({ title, description }: EmbedArgs): SmoothieEmbedOutput {
        return this.create({
            level: "success",
            title: title,
            description: description,
        });
    }

    static info({ title, description }: EmbedArgs): SmoothieEmbedOutput {
        return this.create({
            level: "info",
            title: title,
            description: description,
        });
    }

    static warn({ title, description }: EmbedArgs): SmoothieEmbedOutput {
        return this.create({
            level: "warn",
            title: title,
            description: description,
        });
    }

    static error({ title, description }: EmbedArgs): SmoothieEmbedOutput {
        return this.create({
            level: "error",
            title: title,
            description: description,
        });
    }

    private static _getColor(level: ReplyLevel): number {
        switch (level) {
            case "success":
                return 0x34c759;
            case "info":
                return 0x5856d6;
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
}
