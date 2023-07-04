import type { BaseMessageOptions } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { PlayingNowEmbedArgs } from "../../typings/structures/embed/Embed.js";
import BasicEmbed from "./BasicEmbed.js";
import { formatTimeWithColon } from "../../utils/formatTime.js";
import { Emojis } from "../../typings/emoji/Emoji.js";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class PlayingNowEmbed {
    static create({
        title,
        description = null,
        fields = [],
        thumbnail = null,
        url = null,
        author = null,
        emoji = Emojis.youtube,
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
            color: 0x30a45a,
            thumbnail: thumbnail,
            url: url,
            author: author,
            emoji: emoji,
        });

        // Create Component
        const prevButton = new ButtonBuilder()
            .setCustomId("prev")
            .setEmoji(Emojis.trackPrevious)
            .setStyle(ButtonStyle.Primary);

        const pauseButton = new ButtonBuilder()
            .setCustomId("pause")
            .setEmoji(Emojis.pause)
            .setStyle(ButtonStyle.Danger);

        const unpauseButton = new ButtonBuilder()
            .setCustomId("unpause")
            .setEmoji(Emojis.next)
            .setStyle(ButtonStyle.Danger);

        const skipButton = new ButtonBuilder()
            .setCustomId("skip")
            .setEmoji(Emojis.skip)
            .setStyle(ButtonStyle.Primary);

        const shuffleButton = new ButtonBuilder()
            .setCustomId("shuffle")
            .setEmoji(Emojis.shuffle)
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
        const totalCharacters = 17;

        // When there is no duration (e.g. livestream), display full progress bar
        if (duration === 0) {
            return `${
                Emojis.leftProgressFilled
            }${Emojis.centerProgressFilled.repeat(totalCharacters - 2)}${
                Emojis.rightProgressFilled
            } ${formatTimeWithColon(playedFor)}`;
        }

        playedFor = playedFor > duration ? duration : playedFor;
        const progress = Math.max(Math.min(playedFor / duration, 1), 0);
        const index = Math.floor(progress * totalCharacters);
        let numOfFilledCenter = Math.max(index - 1, 0);
        if (progress === 1) {
            numOfFilledCenter -= 1;
        }
        const numOfEmptyCenter = Math.max(
            totalCharacters - 2 - numOfFilledCenter,
            0
        );

        let str: string =
            index === 0 ? Emojis.leftProgressEmpty : Emojis.leftProgressFilled;
        str += Emojis.centerProgressFilled.repeat(numOfFilledCenter);
        str += Emojis.centerProgressEmpty.repeat(numOfEmptyCenter);
        str +=
            index === totalCharacters
                ? Emojis.rightProgressFilled
                : Emojis.rightProgressEmpty;
        str += ` ${formatTimeWithColon(playedFor)} / ${formatTimeWithColon(
            duration
        )}`;

        return str;
    }
}
