import type { VoiceConnection } from "@discordjs/voice";
import { getVoiceConnection } from "@discordjs/voice";
import { VoiceConnectionStatus } from "@discordjs/voice";
import { joinVoiceChannel } from "@discordjs/voice";
import { client } from "../../index.js";
import Logging from "../logging/Logging.js";
import createGuildPrefix from "../../utils/createGuildPrefix.js";
import createChannelPrefix from "../../utils/createChannelPrefix.js";
import SmoothieAudioPlayer from "./SmoothieAudioPlayer.js";
import GuildStatesHandler from "../database/GuildStatesHandler.js";
import type { VoiceChannel } from "discord.js";
import GuildDataHandler from "../database/GuildDataHandler.js";
import { clearInterval } from "timers";

export default class SmoothieVoiceConnection {
    channelId: string | null = null;
    connection: VoiceConnection | undefined = undefined;
    player: SmoothieAudioPlayer;
    private _guildData: GuildDataHandler;
    private _guildStates: GuildStatesHandler;
    private _stayTimer?: NodeJS.Timer;
    private _prevTime: DOMHighResTimeStamp;

    constructor(public guildId: string) {
        this.player = new SmoothieAudioPlayer(guildId);
        client.audioPlayers.set(guildId, this.player);
        this._guildData = new GuildDataHandler(guildId);
        this._guildStates = new GuildStatesHandler(guildId);
        this._prevTime = performance.now();
    }

    async connect(channelId: string): Promise<boolean> {
        const guildPrefix = createGuildPrefix(this.guildId);
        const channelPrefix = createChannelPrefix(channelId);

        this.connection = getVoiceConnection(this.guildId);
        if (this.connection) {
            // Join from another voice channel
            this.connection.removeAllListeners();
        }

        const adapter = client.guilds.cache.get(
            this.guildId
        )?.voiceAdapterCreator;
        if (!adapter) return false;

        this.connection = joinVoiceChannel({
            guildId: this.guildId,
            channelId: channelId,
            adapterCreator: adapter,
            selfDeaf: true,
        });

        // When Smoothie is connecting the voice channel
        this.connection.on(VoiceConnectionStatus.Connecting, () => {
            Logging.info(
                guildPrefix,
                channelPrefix,
                `Smoothie is connecting to the voice channel.`
            );
            return;
        });

        // When Smoothie joins the voice channel
        this.connection.on(VoiceConnectionStatus.Ready, () => {
            Logging.success(
                guildPrefix,
                channelPrefix,
                `Smoothie has joined to the voice channel.`
            );
            return;
        });

        // Start the audio player
        await this.player.start();
        this.connection.subscribe(this.player.player);

        this.channelId = channelId;

        // Update database voiceChannelId
        await this._guildStates.update("voiceChannelId", channelId);

        // Start user staying count
        this._startStayingTimer();
        return true;
    }

    async disconnect() {
        if (!this.connection) return true;
        this.connection.destroy();
        this.connection = undefined;
        this.channelId = null;
        clearInterval(this._stayTimer);
        await this._guildStates.update("voiceChannelId", null);
        return true;
    }

    private _startStayingTimer() {
        this._prevTime = performance.now();
        this._stayTimer = setInterval(() => {
            void (async () => {
                if (!this.channelId) return;
                const channel = client.channels.cache.get(
                    this.channelId
                ) as VoiceChannel | null;
                if (!channel) return;
                const userStats = await this._guildData.get("userStats");
                if (!userStats) return;

                const userIds = channel.members
                    .filter((member) => member.user !== client.user)
                    .map((member) => member.user.id);

                if (userIds.length === 0) return;

                const now = performance.now();
                const timeElapsed = (now - this._prevTime) / 1000;

                for (const userId of userIds) {
                    const stats = userStats.find(
                        (stats) => stats.userId === userId
                    );
                    // Create this user stats if it does not exist
                    if (!stats) {
                        userStats.push({
                            userId: userId,
                            stayDuration: timeElapsed,
                            songStats: [],
                        });
                        continue;
                    }
                    stats.stayDuration += timeElapsed;
                }

                await this._guildData.update("userStats", userStats);
                this._prevTime = now;
            })();
        }, 30000);
    }
}
