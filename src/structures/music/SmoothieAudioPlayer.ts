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
import type { YoutubeBasicInfo } from "../../typings/structures/music/URLHandler.js";
import type { Playlist } from "../../models/music/Playlist.js";
import { stream } from "play-dl";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export default class SmoothieAudioPlayer {
    player: AudioPlayer;
    private _playedFor = 0;
    private _musicTimer?: SetIntervalAsyncTimer<unknown[]>;
    private _reply: ReplyHandler;
    private _guildPrefix: string;
    private _currentSong: DocumentType<Song> | null = null;
    private _songInfo: YoutubeBasicInfo | null = null;
    private _registeredStateChanges = false;
    private _buttonsCollector?: InteractionCollector<
        MappedInteractionTypes[MessageComponentType]
    >;
    private _nextFiveSongs?: DocumentType<Song>[];
    private _isForceStop = false;
    private _prevTime: DOMHighResTimeStamp;
    private _errorCount = 0;
    private _language = defaultLanguage;
    private _message: MessageCommandPayload | null = null;
    private _playlist: DocumentType<Playlist> | null = null;

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
        const resource = await this._createAudioResource(song);
        this._songInfo = await URLHandler.getBasicInfo(song.url);
        if (!resource || !this._songInfo) {
            await this._onPlayerError(song);
            return null;
        }

        this._currentSong = song;
        this._language =
            (await ConfigsModel.findByGuildId(this.guildId))?.language ??
            defaultLanguage;

        await this._stopTimer();
        this._playedFor = 0;
        await this._removePreviousPlayingNowMessage();
        this._message = await this._sendPlayingNowMessage(false);

        this.player.play(resource);

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

    private async _createAudioResource(song: DocumentType<Song>) {
        const stream = await this._createNormalizedStream(song);

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
            if (
                oldState.status === AudioPlayerStatus.Buffering ||
                oldState.status === AudioPlayerStatus.Idle
            ) {
                const song = newState.resource.metadata as DocumentType<Song>;
                Logging.info(this._guildPrefix, `Playing ${song.title}`);
            } else if (oldState.status === AudioPlayerStatus.Paused) {
                Logging.info(this._guildPrefix, "The song has been resumed.");
            }
        });

        this.player.on(AudioPlayerStatus.Paused, () => {
            Logging.info(this._guildPrefix, "The song has been paused.");
            void (async () => {
                await this._stopTimer();
                await this._updatePlayingNowMessage();
            })();
        });

        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            void (async () => {
                await this._stopTimer();
                await this._updatePlayingNowMessage();
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

    private async _removePreviousPlayingNowMessage() {
        if (this._message) {
            try {
                await this._message.delete();
                await StatesModel.findAndSetPlayingNowChannelId(
                    this.guildId,
                    null
                );
                await StatesModel.findAndSetPlayingNowMessageId(
                    this.guildId,
                    null
                );
            } catch (err) {
                Logging.warn(
                    this._guildPrefix,
                    "Failed to delete previous playing now message."
                );
            }
            this._message = null;
        }
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
            await StatesModel.findAndSetPlayingNowChannelId(this.guildId, null);
            await StatesModel.findAndSetPlayingNowMessageId(this.guildId, null);
        }
    }

    private async _createPlayingNowEmbed(useCache = true) {
        if (!this._songInfo) {
            return null;
        }

        const language = this._language;

        const { url, duration, thumbnailURL, title, uploader, uploaderURL } =
            this._songInfo;
        const fields: APIEmbedField[] = [];

        // Add uploaded to field
        if (uploader && uploaderURL) {
            fields.push({
                name: getLocale(language, "uploadedByField"),
                value: `[${uploader}](${uploaderURL})`,
                inline: true,
            });
        }

        if (this._currentSong) {
            // Add song added date
            fields.push({
                name: getLocale(language, "addedAtField"),
                value: `<t:${Math.floor(
                    this._currentSong.createdAt.getTime() / 1000
                )}>`,
                inline: true,
            });

            // Add song play count
            fields.push({
                name: getLocale(language, "playCountField"),
                value: this._currentSong.playCount.toString(),
                inline: true,
            });
        }

        let queue: DocumentType<Song>[] | null = null;
        let playlist: DocumentType<Playlist> | null = null;
        if (!useCache || !this._nextFiveSongs || !this._playlist) {
            playlist = await StatesModel.findCurrentPlaylist(this.guildId);
            this._playlist = playlist;
            if (playlist) {
                queue = await playlist.getQueue(
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    { _id: 1, title: 1 },
                    1,
                    5
                );
                this._nextFiveSongs = queue;
            }
        } else {
            queue = this._nextFiveSongs;
            playlist = this._playlist;
        }

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
        }

        if (queue) {
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

        const isPaused =
            this.player.state.status === AudioPlayerStatus.Paused ||
            this.player.state.status === AudioPlayerStatus.AutoPaused;

        return PlayingNowEmbed.create({
            title: getLocale(language, "playingNowTitle"),
            description: `### [${title}](${url})`,
            fields: fields,
            thumbnail: thumbnailURL,
            playedFor: this._playedFor,
            duration: duration,
            isPaused: isPaused,
            queueButtonText: getLocale(language, "queueButton"),
            playlistInfoButtonText: getLocale(language, "playlistInfoButton"),
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
                    break;
                }
                case "unpause": {
                    this.unpause();
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
            await this._updatePlayingNowMessage(false);
        });
    }

    private async _sendPlayingNowMessage(useCache = true) {
        const embed = await this._createPlayingNowEmbed(useCache);
        if (!embed) {
            return null;
        }
        const message = await this._reply.send(embed);
        if (message) {
            this._registerPlayingNowButtons(message);

            await StatesModel.findAndSetPlayingNowChannelId(
                this.guildId,
                message.channelId
            );
            await StatesModel.findAndSetPlayingNowMessageId(
                this.guildId,
                message.id
            );
        }
        return message;
    }

    private async _updatePlayingNowMessage(useCache = true) {
        const embed = await this._createPlayingNowEmbed(useCache);
        if (!embed || !this._message) {
            return;
        }
        try {
            await this._message.edit(embed);
        } catch (err) {
            Logging.warn(
                this._guildPrefix,
                "Failed to edit playing now message."
            );
        }
    }

    private async _stopTimer() {
        if (this._musicTimer) {
            Logging.debug(this._guildPrefix, "Stopped the music timer.");
            await clearIntervalAsync(this._musicTimer);
            this._updatePlayedFor();
        }
    }

    private _startTimer() {
        Logging.debug(this._guildPrefix, "Started the music timer.");
        this._prevTime = performance.now();
        this._musicTimer = setIntervalAsync(async () => {
            this._updatePlayedFor();
            await this._updatePlayingNowMessage();
        }, 1000);
    }

    private _updatePlayedFor() {
        const now = performance.now();
        const timeElapsed = now - this._prevTime;
        this._playedFor += timeElapsed / 1000;
        this._prevTime = now;
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

    private async _createNormalizedStream(
        song: DocumentType<Song>
    ): Promise<PassThrough | null> {
        try {
            const playStream = await stream(song.url, {
                discordPlayerCompatibility: true,
            });

            const command = ffmpeg(playStream.stream)
                .format("mp3")
                .audioBitrate(320)
                .audioFilter("loudnorm")
                .on(
                    "error",
                    (err: { outputStreamError?: { code?: string } }) => {
                        if (
                            err.outputStreamError?.code ===
                            "ERR_STREAM_PREMATURE_CLOSE"
                        ) {
                            return;
                        }

                        Logging.error(
                            this._guildPrefix,
                            "There is an error in ffmpeg",
                            err
                        );
                    }
                );

            const passthrough = command
                .pipe()
                .on("error", (err: { code?: string }) => {
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
            });
            return null;
        }
        return await this.playNext();
    }
}
