import { EmbedBuilder } from "@discordjs/builders";
import type { BasicEmbedArgs } from "../../typings/structures/embed/Embed.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class BasicEmbed {
    static create({
        title,
        description,
        footer,
        color = 0x5856d6,
    }: BasicEmbedArgs) {
        footer = footer ? `Smoothie • ${footer}` : "Smoothie";

        if (title.length > 256) {
            title = title.substring(0, 253) + "...";
        }

        if (description.length > 4096) {
            description = description.substring(0, 4093) + "...";
        }

        if (footer.length > 2048) {
            description = description.substring(0, 2045) + "...";
        }

        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setTimestamp()
            .setColor(color)
            .setFooter({
                text: footer,
                iconURL: "attachment://smoothie.png",
            });
    }
}
