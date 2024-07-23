import type { AudioPlayer } from "@discordjs/voice";
import { createAudioResource } from "@discordjs/voice";
import { NoSubscriberBehavior } from "@discordjs/voice";
import { AudioPlayerStatus } from "@discordjs/voice";
import { createAudioPlayer } from "@discordjs/voice";
import createGuildPrefix from "../../utils/createGuildPrefix.js";
import Logging from "../logging/Logging.js";
import type { Song } from "../../models/music/Song.js";
import ReplyHandler from "../commands/ReplyHandler.js";
import PlayingNowEmbed from "../embed/PlayingNowEmbed.js";
import { defaultLanguage, getLocale } from "../../i18n/i18n.js";
import { client } from "../../index.js";
import type {
    APIEmbedField,
    InteractionCollector,
    MappedInteractionTypes,
    MessageComponentType,
    TextChannel,
} from "discord.js";
import type { MessageCommandPayload } from "../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";
import type { VoiceChannel } from "discord.js";
import ytdl from "@distube/ytdl-core";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import type { PassThrough } from "stream";
import type { SetIntervalAsyncTimer } from "set-interval-async";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";
import { StatesModel } from "../../models/guild/States.js";
import { ConfigsModel } from "../../models/guild/Configs.js";
import URLHandler from "./URLHandler.js";
import type { DocumentType } from "@typegoose/typegoose";
import { UserSongStatsModel } from "../../models/user/UserSongStats.js";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export default class SmoothieAudioPlayer {
    player: AudioPlayer;
    playedFor = 0;
    private _musicTimer?: SetIntervalAsyncTimer<unknown[]>;
    private _embedTimer?: SetIntervalAsyncTimer<unknown[]>;
    private _reply: ReplyHandler;
    private _guildPrefix: string;
    private _currentSong: DocumentType<Song> | null = null;
    private _registeredStateChanges = false;
    private _buttonsCollector?: InteractionCollector<
        MappedInteractionTypes[MessageComponentType]
    >;
    private _prevPlayedFor = -1;
    private _clickedPauseOrUnpauseButton = false;
    private _isForceStop = false;
    private _prevTime: DOMHighResTimeStamp;
    private _errorCount = 0;

    constructor(public guildId: string) {
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        this._reply = new ReplyHandler({
            guildId: this.guildId,
        });
        this._guildPrefix = createGuildPrefix(this.guildId);
        this._prevTime = performance.now();
    }

    async start() {
        if (!this._registeredStateChanges) {
            this._registerStateChanges();
            this._registeredStateChanges = true;
        }

        if (this.player.state.status === AudioPlayerStatus.Playing) {
            return this._currentSong;
        }
        if (
            this.player.state.status === AudioPlayerStatus.Paused ||
            this.player.state.status === AudioPlayerStatus.AutoPaused
        ) {
            this.unpause();
            return this._currentSong;
        }
        return this.playFirst();
    }

    async playFirst() {
        const playlist = await StatesModel.findCurrentPlaylist(this.guildId);
        const song = await playlist?.getCurrentSong();

        if (!song) {
            this.pause();
            Logging.warn(this._guildPrefix, "Failed to fetch the first song.");
            return null;
        }
        return this.play(song);
    }

    async playPrev() {
        const playlist = await StatesModel.findCurrentPlaylist(this.guildId);
        const song = await playlist?.prevSong();

        if (!song) {
            this.pause();
            Logging.warn(
                this._guildPrefix,
                "Failed to fetch the previous song."
            );
            return null;
        }
        return this.play(song);
    }

    async playNext() {
        const playlist = await StatesModel.findCurrentPlaylist(this.guildId);
        const song = await playlist?.nextSong();

        if (!song) {
            this.pause();
            Logging.warn(this._guildPrefix, "Failed to fetch the next song.");
            return null;
        }
        return this.play(song);
    }

    async play(song: DocumentType<Song>): Promise<DocumentType<Song> | null> {
        const resource = this._createAudioResource(song);
        if (!resource) {
            return await this._onPlayerError(song);
        }
        this.playedFor = 0;
        this._prevPlayedFor = -1;
        this.player.play(resource);
        this._currentSong = song;

        await this._sendPlayingNowMessage(song);

        return song;
    }

    async skip() {
        const currentSong = this._currentSong;
        const nextSong = await this.playNext();
        if (!nextSong) return null;
        return currentSong;
    }

    pause() {
        return this.player.pause();
    }

    unpause() {
        return this.player.unpause();
    }

    forceStop() {
        this._isForceStop = true;
        return this.player.stop(true);
    }

    private _createAudioResource(song: DocumentType<Song>) {
        const stream = this._createNormalizedStream(song);

        if (stream == null) {
            return null;
        }

        return createAudioResource(stream, {
            metadata: song,
        });
    }

    private _registerStateChanges() {
        this.player.on(AudioPlayerStatus.Idle, (oldState) => {
            void (async () => {
                // When the previous song is finished
                if (
                    oldState.status === AudioPlayerStatus.Playing &&
                    !this._isForceStop
                ) {
                    const song = oldState.resource
                        .metadata as DocumentType<Song>;

                    // Update play count when finished
                    if (!(await this._updatePlayCount(song))) {
                        Logging.warn(
                            this._guildPrefix,
                            "Failed to update play count."
                        );
                    }

                    if (!(await this._updateUsersListenCount(song))) {
                        Logging.warn(
                            this._guildPrefix,
                            "Failed to update users listen count."
                        );
                    }

                    this._errorCount = 0;
                    await this.playNext();
                }
                this._isForceStop = false;
            })();
        });

        this.player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
            this._startTimer();
            this._pauseIfNoOneInChannel();
            if (oldState.status === AudioPlayerStatus.Buffering) {
                const song = newState.resource.metadata as DocumentType<Song>;
                Logging.info(this._guildPrefix, `Playing ${song.title}`);
            } else if (oldState.status === AudioPlayerStatus.Paused) {
                Logging.info(this._guildPrefix, "The song has been resumed.");
            }
        });

        this.player.on(AudioPlayerStatus.Buffering, () => {
            void (async () => {
                if (this._musicTimer) {
                    await clearIntervalAsync(this._musicTimer);
                }
                if (this._embedTimer) {
                    await clearIntervalAsync(this._embedTimer);
                }
            })();
        });

        this.player.on(AudioPlayerStatus.Paused, () => {
            Logging.info(this._guildPrefix, "The song has been paused.");
            void (async () => {
                if (this._musicTimer) {
                    await clearIntervalAsync(this._musicTimer);
                }
            })();
        });

        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            void (async () => {
                if (this._musicTimer) {
                    await clearIntervalAsync(this._musicTimer);
                }
            })();
        });

        this.player.on("error", (err) => {
            Logging.error(this._guildPrefix, err);
            this.pause();
            void (async () => {
                await this._reply.errorSend({
                    title: "errorTitle",
                    description: "unknownStreamErrorMessage",
                });
            })();
        });

        this.player.on("stateChange", (oldState, newState) => {
            Logging.debug(
                this._guildPrefix,
                `Audio player state changed: ${oldState.status} -> ${newState.status}`
            );
        });
    }

    private _registerPlayingNowButtons(message: MessageCommandPayload) {
        // Stop previous listener
        this._buttonsCollector?.removeAllListeners();
        this._buttonsCollector?.stop();

        this._buttonsCollector =
            message.channel.createMessageComponentCollector({
                filter: (interaction) => interaction.message.id === message.id,
            });

        this._buttonsCollector.on("collect", async (interaction) => {
            await interaction.deferUpdate();
            switch (interaction.customId) {
                case "prev": {
                    const command = client.commands.get(Commands.prev);
                    const reply = new ReplyHandler({
                        guildId: this.guildId,
                    });
                    await command?.run({
                        guildId: this.guildId,
                        payload: message,
                        options: {},
                        reply: reply,
                    });
                    break;
                }
                case "pause": {
                    this.pause();
                    this._clickedPauseOrUnpauseButton = true;
                    break;
                }
                case "unpause": {
                    this.unpause();
                    this._clickedPauseOrUnpauseButton = true;
                    break;
                }
                case "skip": {
                    const command = client.commands.get(Commands.skip);
                    const reply = new ReplyHandler({
                        guildId: this.guildId,
                    });
                    await command?.run({
                        guildId: this.guildId,
                        payload: message,
                        options: {},
                        reply: reply,
                    });
                    break;
                }
                case "shuffle": {
                    const command = client.commands.get(Commands.shuffle);
                    const reply = new ReplyHandler({
                        guildId: this.guildId,
                    });
                    await command?.run({
                        guildId: this.guildId,
                        payload: message,
                        options: {},
                        reply: reply,
                    });
                    break;
                }
                case "queue": {
                    const command = client.commands.get(Commands.queue);
                    const reply = new ReplyHandler({
                        guildId: this.guildId,
                    });
                    await command?.run({
                        guildId: this.guildId,
                        payload: message,
                        options: {},
                        reply: reply,
                    });
                    break;
                }
                case "playlistInfo": {
                    const command = client.commands.get(Commands.infoPlaylist);
                    const reply = new ReplyHandler({
                        guildId: this.guildId,
                    });
                    await command?.run({
                        guildId: this.guildId,
                        payload: message,
                        options: {},
                        reply: reply,
                    });
                    break;
                }
            }
        });
    }

    private async _sendPlayingNowMessage(song: DocumentType<Song>) {
        const language =
            (await ConfigsModel.findByGuildId(this.guildId))?.language ??
            defaultLanguage;

        const isPaused =
            this.player.state.status === AudioPlayerStatus.Paused ||
            this.player.state.status === AudioPlayerStatus.AutoPaused;
        const queueButtonText = getLocale(language, "queueButton");
        const playlistInfoButtonText = getLocale(
            language,
            "playlistInfoButton"
        );
        const fields: APIEmbedField[] = [];

        const info = await URLHandler.getBasicInfo(song.url);

        if (!info) {
            return;
        }

        const { url, duration, thumbnailURL, title, uploader, uploaderURL } =
            info;
        // Add uploaded to field
        if (uploader && uploaderURL) {
            fields.push({
                name: getLocale(language, "uploadedByField"),
                value: `[${uploader}](${uploaderURL})`,
                inline: true,
            });
        }

        // Add song added date
        fields.push({
            name: getLocale(language, "addedAtField"),
            value: `<t:${Math.floor(song.createdAt.getTime() / 1000)}>`,
            inline: true,
        });

        // Add song play count
        fields.push({
            name: getLocale(language, "playCountField"),
            value: song.playCount.toString(),
            inline: true,
        });

        // Add playlist info to field
        const playlist = await StatesModel.findCurrentPlaylist(this.guildId);

        if (playlist) {
            // Add which playlist is playing
            fields.push({
                name: getLocale(language, "playlistField"),
                value: playlist.name,
                inline: true,
            });

            // Add number of songs in playlist
            fields.push({
                name: getLocale(language, "numberOfSongsField"),
                value: playlist.queue.length.toString(),
                inline: true,
            });

            // Add next five songs list
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const queue = await playlist.getQueue({ _id: 1, title: 1 }, 1, 5);
            const nextFiveSongs = queue.map(
                (song, i) => `${i + 2}. ${song.title}`
            );
            const nextFiveSongsString = nextFiveSongs.length
                ? `\`\`\`md\n${nextFiveSongs.join("\n")}\n\`\`\``
                : getLocale(language, "noUpComingSongMessage");
            fields.push({
                name: getLocale(language, "upComingField"),
                value: nextFiveSongsString,
                inline: false,
            });
        }

        const embed = PlayingNowEmbed.create({
            title: getLocale(language, "playingNowTitle"),
            description: `### [${title}](${url})`,
            fields: fields,
            thumbnail: thumbnailURL,
            playedFor: this.playedFor,
            duration: duration,
            isPaused: isPaused,
            queueButtonText: queueButtonText,
            playlistInfoButtonText: playlistInfoButtonText,
        });

        const message = await this._reply.send(embed);
        if (message) {
            this._registerPlayingNowButtons(message);
            // Remove previous playing now message
            const state = await StatesModel.findByGuildId(this.guildId);
            if (state?.playingNowMessageId && state.playingNowChannelId) {
                try {
                    const channel = client.channels.cache.get(
                        state.playingNowChannelId
                    ) as TextChannel | null;
                    const message = await channel?.messages.fetch(
                        state.playingNowMessageId
                    );
                    await message?.delete();
                } catch (err) {
                    Logging.warn(
                        this._guildPrefix,
                        "Failed to delete previous playing now message."
                    );
                }
            }

            await StatesModel.findAndSetPlayingNowChannelId(
                this.guildId,
                message.channelId
            );
            await StatesModel.findAndSetPlayingNowMessageId(
                this.guildId,
                message.id
            );
        }

        // Update the playing now message every 5 seconds
        if (this._embedTimer) {
            await clearIntervalAsync(this._embedTimer);
        }
        this._embedTimer = setIntervalAsync(async () => {
            // Update the playing now message when timer changes or clicked pause or
            // unpause button
            if (
                this.playedFor !== this._prevPlayedFor ||
                this._clickedPauseOrUnpauseButton
            ) {
                const isPaused =
                    this.player.state.status === AudioPlayerStatus.Paused ||
                    this.player.state.status === AudioPlayerStatus.AutoPaused;

                const playlist = await StatesModel.findCurrentPlaylist(
                    this.guildId
                );
                if (playlist) {
                    fields.pop();
                    const queue = await playlist.getQueue(
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        { _id: 1, title: 1 },
                        1,
                        5
                    );
                    const nextFiveSongs = queue.map(
                        (song, i) => `${i + 2}. ${song.title}`
                    );
                    const nextFiveSongsString = nextFiveSongs.length
                        ? `\`\`\`md\n${nextFiveSongs.join("\n")}\n\`\`\``
                        : getLocale(language, "noUpComingSongMessage");
                    fields.push({
                        name: getLocale(language, "upComingField"),
                        value: nextFiveSongsString,
                        inline: false,
                    });
                }

                const embed = PlayingNowEmbed.create({
                    title: getLocale(language, "playingNowTitle"),
                    description: `### [${title}](${url})`,
                    fields: fields,
                    thumbnail: thumbnailURL,
                    playedFor: this.playedFor,
                    duration: duration,
                    isPaused: isPaused,
                    queueButtonText: queueButtonText,
                    playlistInfoButtonText: playlistInfoButtonText,
                });
                await this._reply.reply(embed);
                this._clickedPauseOrUnpauseButton = false;
                if (this.playedFor >= duration && duration !== 0) {
                    if (this._embedTimer) {
                        await clearIntervalAsync(this._embedTimer);
                    }
                }
            }
            this._prevPlayedFor = this.playedFor;
        }, 10000);
    }

    private _startTimer() {
        this._prevTime = performance.now();
        this._musicTimer = setIntervalAsync(() => {
            const now = performance.now();
            const timeElapsed = now - this._prevTime;
            this.playedFor += timeElapsed / 1000;
            this._prevTime = now;
        }, 1000);
    }

    private async _updatePlayCount(song: DocumentType<Song>) {
        await song.incrementPlayCountAndSave();
        return true;
    }

    private async _updateUsersListenCount(song: DocumentType<Song>) {
        const channelId = client.voiceConnections.get(this.guildId)?.channelId;
        if (!channelId) return false;

        const channel = client.channels.cache.get(
            channelId
        ) as VoiceChannel | null;
        if (!channel) return false;

        const userIds = channel.members
            .filter((member) => member.user !== client.user)
            .map((member) => member.user.id);

        if (userIds.length === 0) return true;

        for (const userId of userIds) {
            const userSongStats =
                await UserSongStatsModel.findByGuildIdUserIdAndSong(
                    this.guildId,
                    userId,
                    song
                );
            if (!userSongStats) {
                continue;
            }
            await userSongStats.incrementListenCountAndSave();
        }

        return true;
    }

    private _pauseIfNoOneInChannel() {
        // Check if there is anyone in the voice channel, if not, pause the music
        const channelId = client.voiceConnections.get(this.guildId)?.channelId;
        if (!channelId) return;

        const channel = client.channels.cache.get(
            channelId
        ) as VoiceChannel | null;
        if (!channel) return;

        const userIds = channel.members
            .filter((member) => member.user !== client.user)
            .map((member) => member.user.id);

        if (userIds.length === 0) {
            this.pause();
        }
    }

    private _createNormalizedStream(
        song: DocumentType<Song>
    ): PassThrough | null {
        try {
            const stream = ytdl(song.url, {
                filter: "audioonly",
                liveBuffer: 0,
                highWaterMark: 1 << 62,
                quality: "highestaudio",
                dlChunkSize: 0,
            }).on("error", (err) => {
                Logging.error(
                    this._guildPrefix,
                    `There is an error in ytdl stream for ${song.url}... Playing next song.`,
                    err
                );
                void (async () => {
                    await this._onPlayerError(song);
                })();
            });

            const command = ffmpeg(stream)
                .format("mp3")
                .audioBitrate(320)
                .audioFilter("loudnorm")
                .on("error", (err: { outputStreamError: { code: string } }) => {
                    if (
                        err.outputStreamError.code ===
                        "ERR_STREAM_PREMATURE_CLOSE"
                    ) {
                        return;
                    }

                    Logging.error(
                        this._guildPrefix,
                        "There is an error in ffmpeg",
                        err
                    );
                });

            const passthrough = command
                .pipe()
                .on("error", (err: { code: string }) => {
                    if (err.code === "ERR_STREAM_PREMATURE_CLOSE") {
                        Logging.info(
                            this._guildPrefix,
                            "Passthrough stream has been interrupted."
                        );
                        return;
                    }

                    Logging.error(
                        this._guildPrefix,
                        "There is an error in passthrough stream",
                        err
                    );
                }) as PassThrough;

            return passthrough;
        } catch (err) {
            Logging.error(
                this._guildPrefix,
                `There is an error in ytdl stream for ${song.url}`,
                err
            );
            return null;
        }
    }

    private async _onPlayerError(song: DocumentType<Song>) {
        this.pause();
        this._errorCount++;
        if (this._errorCount === 1) {
            await this._reply.errorSend({
                title: "errorTitle",
                description: "playSongFailedMessage",
                descriptionArgs: [song.url],
            });
        }

        if (this._errorCount >= 3) {
            await this._reply.errorSend({
                title: "errorTitle",
                description: "playSongFailedThriceMessage",
                descriptionArgs: [song.url],
            });
            return null;
        }
        return await this.playNext();
    }
}
