import { EmbedBuilder } from "@discordjs/builders";
import { AttachmentBuilder } from "discord.js";
import type { ReplyLevel } from "../../typings/structures/commands/ReplyHandler.js";
import type SmoothieEmbedOutput from "../../typings/structures/embed/SmoothieEmbed.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class SmoothieEmbed {
    static create(
        level: ReplyLevel,
        title: string,
        description: string
    ): SmoothieEmbedOutput {
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
        const embed = this._createBasicEmbed(title, description).setColor(
            this._getColor(level)
        );
        return { embeds: [embed], files: [file] };
    }

    static success(title: string, description: string): SmoothieEmbedOutput {
        return this.create("success", title, description);
    }

    static info(title: string, description: string): SmoothieEmbedOutput {
        return this.create("info", title, description);
    }

    static warn(title: string, description: string): SmoothieEmbedOutput {
        return this.create("warn", title, description);
    }

    static error(title: string, description: string): SmoothieEmbedOutput {
        return this.create("error", title, description);
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

    private static _createBasicEmbed(
        title: string,
        description: string
    ): EmbedBuilder {
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
