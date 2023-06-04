import type { BaseMessageOptions } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { AttachmentBuilder } from "discord.js";
import type { PaginationEmbedArgs } from "../../typings/structures/embed/Embed.js";
import LevelEmbed from "./LevelEmbed.js";
import BasicEmbed from "./BasicEmbed.js";

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
    }: PaginationEmbedArgs): BaseMessageOptions {
        // Check if list is empty
        if (list.length === 0) {
            return LevelEmbed.create({
                level: "error",
                title: "errorTitle",
                description: "noItemInListMessage",
            });
        }

        // Create file
        const file = new AttachmentBuilder("./icons/mipmap-hdpi/smoothie.png");

        const maxPage = Math.ceil(list.length / itemsPerPage);

        // clamp the page
        page = Math.min(Math.max(page, 1), maxPage);

        const pageList = list
            .map((item, i) => `${i + 1}. ${item}`)
            .slice((page - 1) * itemsPerPage, page * itemsPerPage);

        const description = `\`\`\`md\n${pageList.join("\n")}\n\`\`\``;

        // Create Embed
        const embed = BasicEmbed.create({
            title: title,
            description: description,
            footer: footer,
        });
        // Create Component
        const firstPageButton = new ButtonBuilder()
            .setCustomId("firstPage")
            .setEmoji("⏪")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(page === 1);

        const prevPageButton = new ButtonBuilder()
            .setCustomId("prevPage")
            .setEmoji("◀️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 1);

        const nextPageButton = new ButtonBuilder()
            .setCustomId("nextPage")
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === maxPage);

        const lastPageButton = new ButtonBuilder()
            .setCustomId("lastPage")
            .setEmoji("⏩")
            .setStyle(ButtonStyle.Danger)
            .setDisabled(page === maxPage);

        const choosePageButton = new ButtonBuilder()
            .setCustomId("choosePage")
            .setEmoji("#️⃣")
            .setStyle(ButtonStyle.Success)
            .setDisabled(maxPage === 1);

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            firstPageButton,
            prevPageButton,
            nextPageButton,
            lastPageButton,
            choosePageButton
        );

        return {
            embeds: [embed],
            files: [file],
            components: [row],
        };
    }
}
