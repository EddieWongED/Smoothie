import { EmbedBuilder } from "@discordjs/builders";
import type { BaseMessageOptions } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AttachmentBuilder } from "discord.js";
import type {
    ConfirmEmbedArgs,
    EmbedArgs,
} from "../../typings/structures/embed/Embed.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ConfirmEmbed {
    // Unit: millisecond
    public static time = 60000;

    static create({
        title,
        description,
    }: ConfirmEmbedArgs): BaseMessageOptions {
        // Create file
        const file = new AttachmentBuilder("./icons/mipmap-hdpi/smoothie.png");

        // Create Embed
        const embed = this._createBasicEmbed({
            title: title,
            description: description,
        });

        // Create Component
        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel")
            .setEmoji("❎")
            .setStyle(ButtonStyle.Danger);

        const confirmButton = new ButtonBuilder()
            .setCustomId("confirm")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            cancelButton,
            confirmButton
        );

        return {
            embeds: [embed],
            files: [file],
            components: [row],
        };
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
            .setColor(0xcf000f)
            .setFooter({
                text: "Smoothie",
                iconURL: "attachment://smoothie.png",
            });
    }
}
