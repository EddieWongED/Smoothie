import { EmbedBuilder } from "@discordjs/builders";
import type { BasicEmbedArgs } from "../../typings/structures/embed/Embed.js";
import type { BaseMessageOptions } from "discord.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class BasicEmbed {
    static create({
        title,
        description = null,
        footer,
        fields = [],
        color = 0x5856d6,
        thumbnail = null,
        author = null,
        url = null,
    }: BasicEmbedArgs): BaseMessageOptions {
        footer = footer ? `Smoothie • ${footer}` : "Smoothie";

        if (title.length > 256) {
            title = title.substring(0, 253) + "...";
        }

        if (description && description.length > 4096) {
            description = description.substring(0, 4093) + "...";
        }

        if (footer.length > 2048) {
            footer = footer.substring(0, 2045) + "...";
        }

        fields = fields.map((field) => {
            if (field.name.length > 256) {
                field.name = field.name.substring(0, 253) + "...";
            }

            if (field.value.length > 1024) {
                field.value = field.value.substring(0, 1021) + "...";
            }
            return field;
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .addFields(fields)
            .setTimestamp()
            .setURL(url)
            .setAuthor(author)
            .setColor(color)
            .setThumbnail(thumbnail)
            .setFooter({
                text: footer,
            });

        return { embeds: [embed], files: [] };
    }
}
