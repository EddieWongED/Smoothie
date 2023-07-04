import type { BaseMessageOptions } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { PaginationEmbedArgs } from "../../typings/structures/embed/Embed.js";
import BasicEmbed from "./BasicEmbed.js";
import { Emojis } from "../../typings/emoji/Emoji.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class PaginationEmbed {
    // Unit: millisecond
    public static idleTime = 120000;

    static create({
        title,
        list,
        page,
        footer,
        itemsPerPage = 10,
        indexing = true,
        emoji,
    }: PaginationEmbedArgs): BaseMessageOptions {
        const maxPage = Math.ceil(list.length / itemsPerPage);

        // clamp the page
        page = Math.min(Math.max(page, 1), maxPage);

        const pageList = list
            .map((item, i) => {
                const index = indexing ? `${i + 1}. ` : "";
                return `${index}${item}`;
            })
            .slice((page - 1) * itemsPerPage, page * itemsPerPage);

        const description =
            pageList.length === 0
                ? `\`\`\`md\n \n\`\`\``
                : `\`\`\`md\n${pageList.join("\n")}\n\`\`\``;

        footer = `${page}/${maxPage} • ${footer}`;

        // Create Embed
        const embed = BasicEmbed.create({
            title: title,
            description: description,
            footer: footer,
            emoji: emoji,
        });

        // Create Component
        const firstPageButton = new ButtonBuilder()
            .setCustomId("firstPage")
            .setEmoji(Emojis.rewind)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(page <= 1);

        const prevPageButton = new ButtonBuilder()
            .setCustomId("prevPage")
            .setEmoji(Emojis.previous)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page <= 1);

        const nextPageButton = new ButtonBuilder()
            .setCustomId("nextPage")
            .setEmoji(Emojis.next)
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === maxPage);

        const lastPageButton = new ButtonBuilder()
            .setCustomId("lastPage")
            .setEmoji(Emojis.fastForward)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(page === maxPage);

        const choosePageButton = new ButtonBuilder()
            .setCustomId("choosePage")
            .setEmoji(Emojis.hashtag)
            .setStyle(ButtonStyle.Success)
            .setDisabled(maxPage <= 1);

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            firstPageButton,
            prevPageButton,
            nextPageButton,
            lastPageButton,
            choosePageButton
        );

        embed.components = [row];
        return embed;
    }
}
