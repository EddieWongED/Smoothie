import type { BaseMessageOptions } from "discord.js";
import { ActionRowBuilder } from "discord.js";
import type { OptionsEmbedArgs } from "../../typings/structures/embed/Embed.js";
import BasicEmbed from "./BasicEmbed.js";
import { StringSelectMenuBuilder } from "@discordjs/builders";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class OptionsEmbed {
    // Unit: millisecond
    public static time = 120000;
    public static customIdPrefix = "select";
    static create({
        title,
        description = null,
        footer,
        emoji,
        options,
        placeholder,
        minValues = 1,
        maxValues = 1,
    }: OptionsEmbedArgs): BaseMessageOptions {
        if (options.length === 0) {
            options.push({ label: " ", value: " " });
        }

        // Only four row can be added
        if (options.length > 100) {
            options = options.slice(0, 100);
        }

        // Create Embed
        const embed = BasicEmbed.create({
            title: title,
            description: description,
            footer: footer,
            color: 0xe389b9,
            emoji: emoji,
        });
        embed.components = [];

        // Create select menus
        for (let i = 0; i < Math.ceil(options.length / 25); i++) {
            // For some reason addOptions / setOptions does not work
            const choices = options.slice(i * 25, (i + 1) * 25);

            const select = new StringSelectMenuBuilder({
                options: choices,
            })
                .setCustomId(`${OptionsEmbed.customIdPrefix}${i})`)
                .setMinValues(minValues)
                .setMaxValues(maxValues);

            if (placeholder) {
                select.setPlaceholder(`${placeholder} ${i + 1}`);
            }

            if (choices.length !== 0) {
                const row =
                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        select
                    );
                embed.components.push(row);
            }
        }

        return embed;
    }
}
