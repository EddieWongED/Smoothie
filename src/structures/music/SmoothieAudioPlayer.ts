import type { AudioPlayer } from "@discordjs/voice";
import { createAudioResource } from "@discordjs/voice";
import { NoSubscriberBehavior } from "@discordjs/voice";
import { AudioPlayerStatus } from "@discordjs/voice";
import { createAudioPlayer } from "@discordjs/voice";
import createGuildPrefix from "../../utils/createGuildPrefix.js";
import Logging from "../logging/Logging.js";
import { stream } from "play-dl";
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
import ytdl from "ytdl-core";
import type { MessageCommandPayload } from "../../typings/structures/commands/SmoothieCommand.js";
import { Commands } from "../../typings/structures/commands/SmoothieCommand.js";

export default class SmoothieAudioPlayer {
    player: AudioPlayer;
    playedFor = 0;
    private _musicTimer?: NodeJS.Timer;
    private _embedTimer?: NodeJS.Timer;
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
        const resource = await this._createAudioResource(song);
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

    private async _createAudioResource(song: Song) {
        try {
            const playStream = await stream(song.url, {
                discordPlayerCompatibility: true,
            });
            return createAudioResource(playStream.stream, {
                metadata: song,
            });
        } catch (err) {
            Logging.error(err);
            return null;
        }
    }

    private _registerStateChanges() {
        this.player.on(AudioPlayerStatus.Idle, (oldState) => {
            void (async () => {
                // When the previous song is finished
                if (
                    oldState.status === AudioPlayerStatus.Playing &&
                    !this._isForceStop
                ) {
                    // Update play count when finished
                    if (!(await this._updatePlayCount())) {
                        Logging.warn(
                            this._guildPrefix,
                            "Failed to update play count."
                        );
                    }
                    await this.playNext();
                }
                this._isForceStop = false;
            })();
        });

        this.player.on(AudioPlayerStatus.Playing, (oldState, newState) => {
            this._startTimer();
            if (oldState.status === AudioPlayerStatus.Buffering) {
                const song = newState.resource.metadata as Song;
                Logging.info(this._guildPrefix, `Playing ${song.title}`);
            }
        });

        this.player.on(AudioPlayerStatus.Buffering, () => {
            clearInterval(this._musicTimer);
            clearInterval(this._embedTimer);
        });

        this.player.on(AudioPlayerStatus.Paused, () => {
            clearInterval(this._musicTimer);
        });

        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            clearInterval(this._musicTimer);
        });

        this.player.on("error", (err) => {
            Logging.error(this._guildPrefix, err);
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
        // Remove previous playing now message
        const playingNowMessageId = await this._guildStates.get(
            "playingNowMessageId"
        );
        const playingNowChannelId = await this._guildStates.get(
            "playingNowChannelId"
        );
        const language =
            (await this._guildData.get("language")) ?? defaultLanguage;

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

        const info = await ytdl.getBasicInfo(song.url);
        const thumbnail = info.videoDetails.thumbnails[0]?.url ?? null;
        const authorName = info.videoDetails.author.name;
        const authorURL = info.videoDetails.author.channel_url;
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
        fields.push({
            name: getLocale(language, "uploadedByField"),
            value: `[${authorName}](${authorURL})`,
            inline: true,
        });

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
            thumbnail: thumbnail,
            playedFor: this.playedFor,
            duration: song.duration,
            isPaused: isPaused,
            queueButtonText: queueButtonText,
            playlistInfoButtonText: playlistInfoButtonText,
        });

        const message = await this._reply.send(embed);
        if (message) {
            this._registerPlayingNowButtons(message);
            await this._guildStates.update("playingNowMessageId", message.id);
            await this._guildStates.update(
                "playingNowChannelId",
                message.channelId
            );
        }

        // Update the playing now message every 5 seconds
        this._embedTimer = setInterval(() => {
            void (async () => {
                // Update the playing now message when timer changes or clicked pause or
                // unpause button
                if (
                    this.playedFor !== this._prevPlayedFor ||
                    this._clickedPauseOrUnpauseButton
                ) {
                    const isPaused =
                        this.player.state.status === AudioPlayerStatus.Paused ||
                        this.player.state.status ===
                            AudioPlayerStatus.AutoPaused;
                    const embed = PlayingNowEmbed.create({
                        title: "Playing Now",
                        description: `### [${song.title}](${song.url})`,
                        fields: fields,
                        thumbnail: thumbnail,
                        playedFor: this.playedFor,
                        duration: song.duration,
                        isPaused: isPaused,
                        queueButtonText: queueButtonText,
                        playlistInfoButtonText: playlistInfoButtonText,
                    });
                    await this._reply.reply(embed);
                    this._clickedPauseOrUnpauseButton = false;
                }
                this._prevPlayedFor = this.playedFor;
            })();
        }, 5000);
    }

    private _startTimer() {
        this._musicTimer = setInterval(() => {
            this.playedFor += 1;
        }, 1000);
    }

    private async _updatePlayCount() {
        const queue = await this._queueHandler.fetch();
        if (!queue) return false;
        if (!queue[0]) return false;
        queue[0].playCount += 1;
        return await this._queueHandler.update(queue);
    }
}
