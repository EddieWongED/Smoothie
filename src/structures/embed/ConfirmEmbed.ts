import type { BaseMessageOptions } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { ConfirmEmbedArgs } from "../../typings/structures/embed/Embed.js";
import BasicEmbed from "./BasicEmbed.js";
import { Emojis } from "../../typings/emoji/Emoji.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ConfirmEmbed {
    // Unit: millisecond
    public static time = 60000;

    static create({
        title,
        description = null,
        footer,
        emoji,
    }: ConfirmEmbedArgs): BaseMessageOptions {
        // Create Embed
        const embed = BasicEmbed.create({
            title: title,
            description: description,
            footer: footer,
            color: 0xcf000f,
            emoji: emoji,
        });

        // Create Component
        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel")
            .setEmoji(Emojis.cross)
            .setStyle(ButtonStyle.Danger);

        const confirmButton = new ButtonBuilder()
            .setCustomId("confirm")
            .setEmoji(Emojis.tick)
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            cancelButton,
            confirmButton
        );

        embed.components = [row];

        return embed;
    }
}
