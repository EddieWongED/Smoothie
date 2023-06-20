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
        const prevButton = new ButtonBuilder()
            .setCustomId("prev")
            .setEmoji("⏮️")
            .setStyle(ButtonStyle.Primary);

        const pauseButton = new ButtonBuilder()
            .setCustomId("pause")
            .setEmoji("⏸️")
            .setStyle(ButtonStyle.Danger);

        const unpauseButton = new ButtonBuilder()
            .setCustomId("unpause")
            .setEmoji("▶️")
            .setStyle(ButtonStyle.Danger);

        const skipButton = new ButtonBuilder()
            .setCustomId("skip")
            .setEmoji("⏭️")
            .setStyle(ButtonStyle.Primary);

        const shuffleButton = new ButtonBuilder()
            .setCustomId("shuffle")
            .setEmoji("🔀")
            .setStyle(ButtonStyle.Success);

        const queueButton = new ButtonBuilder()
            .setCustomId("queue")
            .setLabel(queueButtonText)
            .setStyle(ButtonStyle.Primary);

        const playlistInfoButton = new ButtonBuilder()
            .setCustomId("playlistInfo")
            .setLabel(playlistInfoButtonText)
            .setStyle(ButtonStyle.Secondary);

        const row1 = new ActionRowBuilder<ButtonBuilder>().setComponents(
            prevButton,
            isPaused ? unpauseButton : pauseButton,
            skipButton,
            shuffleButton
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().setComponents(
            queueButton,
            playlistInfoButton
        );

        embed.components = [row1, row2];

        return embed;
    }

    private static _createProgressBar(playedFor: number, duration: number) {
        playedFor = playedFor > duration ? duration : playedFor;
        const progress = Math.max(Math.min(playedFor / duration, 1), 0);
        const totalCharacters = 40;
        const radioButtonIndex = Math.floor(progress * totalCharacters);
        return `${"⎯".repeat(radioButtonIndex)}🔘${"⎯".repeat(
            totalCharacters - radioButtonIndex
        )} ${formatTimeWithColon(playedFor)} / ${formatTimeWithColon(
            duration
        )}`;
    }
}
