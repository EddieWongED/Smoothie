import type { AudioPlayer } from "@discordjs/voice";
import { createAudioResource } from "@discordjs/voice";
import { NoSubscriberBehavior } from "@discordjs/voice";
import { AudioPlayerStatus } from "@discordjs/voice";
import { createAudioPlayer } from "@discordjs/voice";
import createGuildPrefix from "../../utils/createGuildPrefix.js";
import Logging from "../logging/Logging.js";
import QueueHandler from "./QueueHandler.js";
import type { Song } from "../../data/music/Song.js";
import ReplyHandler from "../commands/ReplyHandler.js";
import PlayingNowEmbed from "../embed/PlayingNowEmbed.js";
import GuildDataHandler from "../database/GuildDataHandler.js";
import GuildStatesHandler from "../database/GuildStatesHandler.js";
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

ffmpeg.setFfmpegPath(ffmpegPath.path);

export default class SmoothieAudioPlayer {
    player: AudioPlayer;
    playedFor = 0;
    private _musicTimer?: SetIntervalAsyncTimer<unknown[]>;
    private _embedTimer?: SetIntervalAsyncTimer<unknown[]>;
    private _queueHandler: QueueHandler;
    private _reply: ReplyHandler;
    private _guildPrefix: string;
    private _currentSong: Song | null = null;
    private _guildData: GuildDataHandler;
    private _guildStates: GuildStatesHandler;
    private _registeredStateChanges = false;
    private _buttonsCollector?: InteractionCollector<
        MappedInteractionTypes[MessageComponentType]
    >;
    private _prevPlayedFor = -1;
    private _clickedPauseOrUnpauseButton = false;
    private _isForceStop = false;
    private _prevTime: DOMHighResTimeStamp;

    constructor(public guildId: string) {
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        this._reply = new ReplyHandler({
            guildId: this.guildId,
        });
        this._queueHandler = new QueueHandler(guildId);
        this._guildPrefix = createGuildPrefix(this.guildId);
        this._guildData = new GuildDataHandler(guildId);
        this._guildStates = new GuildStatesHandler(guildId);
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
        const song = await this._queueHandler.first();
        if (!song) {
            this.pause();
            Logging.warn(this._guildPrefix, "Failed to fetch the first song.");
            return null;
        }
        return this.play(song);
    }

    async playPrev() {
        const song = await this._queueHandler.prev();
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
        const song = await this._queueHandler.next();
        if (!song) {
            this.pause();
            Logging.warn(this._guildPrefix, "Failed to fetch the next song.");
            return null;
        }
        return this.play(song);
    }

    async play(song: Song) {
        const resource = this._createAudioResource(song);
        if (!resource) {
            this.pause();
            await this._reply.errorSend({
                title: "errorTitle",
                description: "playSongFailedMessage",
                descriptionArgs: [song.url],
            });
            return null;
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

    private _createAudioResource(song: Song) {
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
                    const song = oldState.resource.metadata as Song;

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
                    await this.playNext();
                }
                this._isForceStop = false;
            })();
        });

        this.player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
            this._startTimer();
            this._pauseIfNoOneInChannel();
            if (oldState.status === AudioPlayerStatus.Buffering) {
                const song = newState.resource.metadata as Song;
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
                        guildData: this._guildData,
                        guildStates: this._guildStates,
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
                        guildData: this._guildData,
                        guildStates: this._guildStates,
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
                        guildData: this._guildData,
                        guildStates: this._guildStates,
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
                        guildData: this._guildData,
                        guildStates: this._guildStates,
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
                        guildData: this._guildData,
                        guildStates: this._guildStates,
                        payload: message,
                        options: {},
                        reply: reply,
                    });
                    break;
                }
            }
        });
    }

    private async _sendPlayingNowMessage(song: Song) {
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;
        const isPaused =
            this.player.state.status === AudioPlayerStatus.Paused ||
            this.player.state.status === AudioPlayerStatus.AutoPaused;
        const queueButtonText = getLocale(language, "queueButton");
        const playlistInfoButtonText = getLocale(
            language,
            "playlistInfoButton"
        );
        const fields: APIEmbedField[] = [];

        // Add uploaded to field
        if (song.uploader && song.uploaderURL) {
            fields.push({
                name: getLocale(language, "uploadedByField"),
                value: `[${song.uploader}](${song.uploaderURL})`,
                inline: true,
            });
        }

        // Add song added date
        fields.push({
            name: getLocale(language, "addedAtField"),
            value: `<t:${Math.floor(song.addedAt.getTime() / 1000)}>`,
            inline: true,
        });

        // Add song play count
        fields.push({
            name: getLocale(language, "playCountField"),
            value: song.playCount.toString(),
            inline: true,
        });

        // Add playlist info to field
        const playlistName = await this._guildStates.get("currentPlaylistName");
        const playlists = await this._guildData.get("playlists");
        const playlist = playlists?.find(
            (playlist) => playlist.name === playlistName
        );

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
            const nextFiveSongs = playlist.queue
                .slice(1, 6)
                .map((song, i) => `${i + 2}. ${song.title}`);
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
            description: `### [${song.title}](${song.url})`,
            fields: fields,
            thumbnail: song.thumbnailURL,
            playedFor: this.playedFor,
            duration: song.duration,
            isPaused: isPaused,
            queueButtonText: queueButtonText,
            playlistInfoButtonText: playlistInfoButtonText,
        });

        const message = await this._reply.send(embed);
        if (message) {
            this._registerPlayingNowButtons(message);
            // Remove previous playing now message
            const playingNowMessageId = await this._guildStates.get(
                "playingNowMessageId"
            );
            const playingNowChannelId = await this._guildStates.get(
                "playingNowChannelId"
            );

            if (playingNowMessageId && playingNowChannelId) {
                try {
                    const channel = client.channels.cache.get(
                        playingNowChannelId
                    ) as TextChannel | null;
                    const message = await channel?.messages.fetch(
                        playingNowMessageId
                    );
                    await message?.delete();
                } catch (err) {
                    Logging.warn(
                        this._guildPrefix,
                        "Failed to delete previous playing now message."
                    );
                }
            }

            await this._guildStates.update("playingNowMessageId", message.id);
            await this._guildStates.update(
                "playingNowChannelId",
                message.channelId
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
                const embed = PlayingNowEmbed.create({
                    title: getLocale(language, "playingNowTitle"),
                    description: `### [${song.title}](${song.url})`,
                    fields: fields,
                    thumbnail: song.thumbnailURL,
                    playedFor: this.playedFor,
                    duration: song.duration,
                    isPaused: isPaused,
                    queueButtonText: queueButtonText,
                    playlistInfoButtonText: playlistInfoButtonText,
                });
                await this._reply.reply(embed);
                this._clickedPauseOrUnpauseButton = false;
                if (this.playedFor >= song.duration && song.duration !== 0) {
                    if (this._embedTimer) {
                        await clearIntervalAsync(this._embedTimer);
                    }
                }
            }
            this._prevPlayedFor = this.playedFor;
        }, 5000);
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

    private async _updatePlayCount(song: Song) {
        const queueGenerator = this._queueHandler.fetchThenUpdate();

        // Retrieve Queue
        const queue = (await queueGenerator.next()).value;
        if (!queue) {
            await queueGenerator.throw("Queue not found.");
            return false;
        }
        const songToBeUpdated = queue.find((s) => s.url === song.url);
        if (!songToBeUpdated) {
            await queueGenerator.throw(
                "The song that need to update play count not found."
            );
            return false;
        }

        songToBeUpdated.playCount++;

        // Update queue
        await queueGenerator.next(queue);

        return true;
    }

    private async _updateUsersListenCount(song: Song) {
        const url = song.url;
        const title = song.title;

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

        // Retrieve userStats
        const userStatsGenerator = this._guildData.getThenUpdate("userStats");
        const userStats = (await userStatsGenerator.next()).value;
        if (!userStats) {
            await userStatsGenerator.throw(new Error("Userstats not found."));
            return false;
        }

        for (const userId of userIds) {
            const stats = userStats.find((stats) => stats.userId === userId);
            // Create this user stats if it does not exist
            if (!stats) {
                userStats.push({
                    userId: userId,
                    stayDuration: 0,
                    songStats: [
                        {
                            url: url,
                            title: title,
                            listenCount: 1,
                        },
                    ],
                });
                continue;
            }

            // Create this song stats for this user if it does not exist
            const songStats = stats.songStats.find(
                (songStats) => songStats.url === url
            );
            if (!songStats) {
                stats.songStats.push({
                    url: url,
                    title: title,
                    listenCount: 1,
                });
                continue;
            }
            songStats.listenCount += 1;
        }

        // Update userStats
        await userStatsGenerator.next(userStats);

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

    private _createNormalizedStream(song: Song): PassThrough | null {
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
                    "There is an error in ytdl stream",
                    err
                );
            });

            const command = ffmpeg(stream)
                .format("mp3")
                .audioBitrate(320)
                .audioFilter("loudnorm")
                .on("error", (err) => {
                    Logging.error(
                        this._guildPrefix,
                        "There is an error in ffmpeg",
                        err
                    );
                });

            const passthrough = command.pipe().on("error", (err: Error) => {
                Logging.info(
                    this._guildPrefix,
                    "Audio has be interrupted.",
                    err
                );
            }) as PassThrough;

            return passthrough;
        } catch (e) {
            return null;
        }
    }
}
