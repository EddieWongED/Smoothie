import type { BaseMessageOptions } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { PlayingNowEmbedArgs } from "../../typings/structures/embed/Embed.js";
import BasicEmbed from "./BasicEmbed.js";
import { formatTimeWithColon } from "../../utils/formatTime.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class PlayingNowEmbed {
    static create({
        title,
        description = null,
        fields = [],
        thumbnail = null,
        url = null,
        author = null,
        playedFor,
        duration,
        isPaused,
        queueButtonText,
        playlistInfoButtonText,
    }: PlayingNowEmbedArgs): BaseMessageOptions {
        const progressBar = this._createProgressBar(playedFor, duration);

        // Create Embed
        const embed = BasicEmbed.create({
            title: title,
            description: description ? `${description}\n${progressBar}` : null,
            fields: fields,
            color: 0x3a9bdc,
            thumbnail: thumbnail,
            url: url,
            author: author,
        });

        // Create Component
        const skipButton = new ButtonBuilder()
            .setCustomId("skip")
            .setEmoji("⏭️")
            .setStyle(ButtonStyle.Primary);

        const shuffleButton = new ButtonBuilder()
            .setCustomId("shuffle")
            .setEmoji("🔀")
            .setStyle(ButtonStyle.Success);

        const pauseButton = new ButtonBuilder()
            .setCustomId("pause")
            .setEmoji("⏸️")
            .setStyle(ButtonStyle.Danger);

        const unpauseButton = new ButtonBuilder()
            .setCustomId("unpause")
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Danger);

        const queueButton = new ButtonBuilder()
            .setCustomId("queue")
            .setLabel(queueButtonText)
            .setStyle(ButtonStyle.Secondary);

        const playlistInfoButton = new ButtonBuilder()
            .setCustomId("playlistInfo")
            .setLabel(playlistInfoButtonText)
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            skipButton,
            shuffleButton,
            isPaused ? unpauseButton : pauseButton,
            queueButton,
            playlistInfoButton
        );

        embed.components = [row];

        return embed;
    }

    private static _createProgressBar(playedFor: number, duration: number) {
        playedFor = playedFor > duration ? duration : playedFor;
        const progress = Math.max(Math.min(playedFor / duration, 1), 0);
        const totalSquare = 17;
        const numOfWhite = Math.floor(progress * totalSquare);
        const numOfBlack = totalSquare - numOfWhite;
        return `${"⬜".repeat(numOfWhite)}${"⬛".repeat(
            numOfBlack
        )} ${formatTimeWithColon(playedFor)} / ${formatTimeWithColon(
            duration
        )}`;
    }
}
